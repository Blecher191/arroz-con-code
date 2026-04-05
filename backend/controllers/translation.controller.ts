import type { Request, Response } from 'express';
import { pool } from '../config/database.ts';
import axios from 'axios';
import type { TranslateRequest, TranslationResponse, LibreTranslateRequest, LibreTranslateResponse } from '../interfaces/translation.interfaces.ts';

// MyMemory API endpoint (free, no authentication required)
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Language code mapping
const LANGUAGE_MAP: Record<string, string> = {
  'es': 'es',
  'en': 'en',
};

/**
 * Detect the language of a post
 * Simple heuristic: check for Spanish characters or words
 */
const detectLanguage = (text: string): 'en' | 'es' => {
  // Common Spanish words and characters
  const spanishWords = [
    'el', 'la', 'de', 'y', 'que', 'es', 'en', 'por', 'con', 'para',
    'una', 'los', 'como', 'está', 'pero', 'más', 'sido', 'fue', 'ó', 'á', 'é', 'í', 'ú', 'ñ'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for Spanish-specific characters
  if (/[áéíóúñ¿¡]/i.test(text)) {
    return 'es';
  }
  
  // Count Spanish words
  const words = lowerText.split(/\s+/);
  const spanishWordCount = words.filter(word => spanishWords.includes(word)).length;
  
  // If more than 30% of words are common Spanish words, likely Spanish
  if (words.length > 0 && spanishWordCount / words.length > 0.3) {
    return 'es';
  }
  
  return 'en';
};

/**
 * Translate a post
 */
export const translatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, targetLanguage } = req.body as TranslateRequest;

    // Validate required fields
    if (!postId || !targetLanguage || !['es', 'en'].includes(targetLanguage)) {
      res.status(400).json({ error: 'postId and targetLanguage (es or en) are required' });
      return;
    }

    // Check if post exists
    const postResult = await pool.query(
      'SELECT id, body FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [postId]
    );

    if (postResult.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const post = postResult.rows[0];
    const postBody = post.body as string;

    // Detect original language
    const originalLanguage = detectLanguage(postBody);

    // Check if already translated to target language
    const existingTranslation = await pool.query(
      'SELECT id FROM translations WHERE post_id = $1 AND translated_language = $2',
      [postId, targetLanguage]
    );

    if (existingTranslation.rows.length > 0) {
      // Return existing translation
      const existing = await pool.query(
        'SELECT post_id, original_language, original_text, translated_language, translated_text, created_at FROM translations WHERE post_id = $1 AND translated_language = $2',
        [postId, targetLanguage]
      );

      const translation = existing.rows[0];
      res.status(200).json({
        postId: translation.post_id,
        originalLanguage: translation.original_language,
        originalText: translation.original_text,
        translatedLanguage: translation.translated_language,
        translatedText: translation.translated_text,
        createdAt: translation.created_at,
      } as TranslationResponse);
      return;
    }

    // If target language is same as original, no need to translate
    if (originalLanguage === targetLanguage) {
      console.log(`ℹ Original language same as target (${originalLanguage}). Returning error.`);
      res.status(400).json({ error: 'Post is already in the target language' });
      return;
    }

    // Call MyMemory API
    console.log(`🌐 Translating post ${postId} from ${originalLanguage} to ${targetLanguage}...`);
    console.log(`Post body: "${postBody}"`);
    console.log(`Sending to MyMemory: q="${postBody.substring(0, 50)}...", langpair=${originalLanguage}|${targetLanguage}`);
    
    const requestParams = {
      q: postBody,
      langpair: `${LANGUAGE_MAP[originalLanguage]}|${LANGUAGE_MAP[targetLanguage]}`,
    };
    console.log(`Request params:`, requestParams);
    
    try {
      console.log(`Making axios GET request to: ${MYMEMORY_API_URL}`);
      const response = await axios.get<any>(
        MYMEMORY_API_URL,
        { 
          params: requestParams,
          timeout: 30000 // 30 second timeout
        }
      );

      console.log(`✅ MyMemory response status: ${response.status}`);
      console.log(`Response type: ${typeof response.data}`);
      console.log(`Response.data is null/undefined: ${response.data === null || response.data === undefined}`);
      console.log(`Response.data structure:`, Object.keys(response.data || {}));
      
      // MyMemory returns: { responseStatus: 200, responseData: { translatedText: "..." } }
      const responseData = response.data?.responseData;
      console.log(`responseData:`, responseData);
      const translatedText = responseData?.translatedText;
      console.log(`Extracted translatedText: "${translatedText}" (type: ${typeof translatedText}, length: ${(translatedText as any)?.length})`);

      if (!translatedText || typeof translatedText !== 'string' || translatedText.trim() === '') {
        console.error('❌ MyMemory returned invalid translatedText:', { received: translatedText, responseStatus: response.status, responseData });
        res.status(500).json({ error: 'Translation API returned invalid result format' });
        return;
      }

      // Store translation in database
      const insertResult = await pool.query(
        `INSERT INTO translations (post_id, original_language, original_text, translated_language, translated_text)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING post_id, original_language, original_text, translated_language, translated_text, created_at`,
        [postId, originalLanguage, postBody, targetLanguage, translatedText]
      );

      const translation = insertResult.rows[0];
      res.status(201).json({
        postId: translation.post_id,
        originalLanguage: translation.original_language,
        originalText: translation.original_text,
        translatedLanguage: translation.translated_language,
        translatedText: translation.translated_text,
        createdAt: translation.created_at,
      } as TranslationResponse);

      console.log(`✅ Translation complete for post ${postId}`);
    } catch (apiErr: any) {
      console.error('❌ Error calling MyMemory API');
      console.error('Error message:', apiErr?.message);
      console.error('Error code:', apiErr?.code);
      console.error('Error response status:', apiErr?.response?.status);
      console.error('Error response data:', apiErr?.response?.data);
      console.error('Full error:', apiErr);
      res.status(500).json({ error: 'Failed to call translation API' });
    }
  } catch (err) {
    console.error('Error during translation:', err);
    res.status(500).json({ error: 'An error occurred during translation' });
  }
};

/**
 * Get translation for a post
 */
export const getTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const postIdParam = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const postId = parseInt(postIdParam);
    const targetLanguage = (req.query.language as string) || 'es';

    if (!postId || isNaN(postId) || !['es', 'en'].includes(targetLanguage)) {
      res.status(400).json({ error: 'Valid postId and language (es or en) are required' });
      return;
    }

    const result = await pool.query(
      'SELECT post_id, original_language, original_text, translated_language, translated_text, created_at FROM translations WHERE post_id = $1 AND translated_language = $2',
      [postId, targetLanguage]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No translation found for this post in the requested language' });
      return;
    }

    const translation = result.rows[0];
    res.status(200).json({
      postId: translation.post_id,
      originalLanguage: translation.original_language,
      originalText: translation.original_text,
      translatedLanguage: translation.translated_language,
      translatedText: translation.translated_text,
      createdAt: translation.created_at,
    } as TranslationResponse);
  } catch (err) {
    console.error('Error fetching translation:', err);
    res.status(500).json({ error: 'An error occurred while fetching translation' });
  }
};

export default {
  translatePost,
  getTranslation,
};
