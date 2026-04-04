# Arroz con Code — Screens & Pages

---

| #   | Screen          | Route             | Auth Required             | Description                                                                       |
| --- | --------------- | ----------------- | ------------------------- | --------------------------------------------------------------------------------- |
| 1   | Landing Page    | `/`               | No                        | Hero headline, two CTAs: "Ask AI" and "Join Community"                            |
| 2   | Sign Up         | `/signup`         | No                        | Email + password registration form                                                |
| 3   | Sign In         | `/signin`         | No                        | Email + password login form                                                       |
| 4   | AI Chat         | `/chat`           | No                        | Full-page chat interface — message thread, input box, thumbs up/down on responses |
| 5   | Community Board | `/community`      | No                        | List of posts filterable by category (Education, Healthcare, New Tech)            |
| 6   | Post Detail     | `/community/[id]` | No (read) / Yes (comment) | Full post view with threaded comments — commenting requires login                 |
| 7   | Create Post     | `/community/new`  | Yes                       | Form to create a new post: title, body, category                                  |
| 8   | Settings        | `/settings`       | Yes                       | Change display name, email, password, preferred language, avatar                  |

---

## Notes

- Routes marked **No (read) / Yes (comment)** mean the page loads for everyone but the comment input is gated behind login
- Guests who hit a login-required action are redirected to `/signin` and returned to their original page after
- There is no separate dashboard or home screen after login — the landing page serves both logged-in and logged-out users
