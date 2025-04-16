This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Deployment

- Deploy on [Vercel](https://vercel.com/) for best Next.js support.
- Set the same environment variables in your Vercel dashboard.

---

## Admin/Owner Logic

- **Edit button**: Only visible to the profile owner or admins.
- **Edit page**: Only accessible to the profile owner or admins; others see a 403.
- **Admin**: Can edit any profile.

---

## Troubleshooting & FAQ

### 1. Why can't users edit profiles they don't own?
RLS policies enforce this at the database level for security. Only owners and admins can edit.

### 2. How do I make a user an admin?
Update their `user_type` in the `users` table to `'admin'`:

```sql
update public.users set user_type = 'admin' where email = 'admin@example.com';
```

### 3. I get a 403 error on edit page, but I'm logged in!
Make sure your user is either the owner of the profile or has `user_type = 'admin'`.

### 4. How do I add more user types or permissions?
Update the `user_type` check in the RLS policies and in your app logic.

---

## Contributing

Pull requests are welcome! Please follow the Airbnb style guide and the conventions in this repo.

---

## License

MIT

---

## Credits

- [Supabase](https://supabase.com/)
- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
