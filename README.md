# SpeakEasy MVP

SpeakEasy is an AI expression assistant for Chinese international students. It helps users turn Chinese or mixed-language thoughts into simple, natural, advisor-ready English expressions.

This project is a single-page website with a Vercel Serverless API route.

## How to use

Open the deployed SpeakEasy website link in a browser.

Normal users do not need to install anything or enter a Gemini API key. The website calls the backend API automatically.

## Files

- `index.html` - frontend website and interaction UI
- `api/generate.js` - Vercel Serverless Function that calls Gemini

## Developer deployment

If you want to deploy your own copy of this project, deploy this repository on Vercel.

Required environment variable:

```text
GEMINI_API_KEY=your_gemini_api_key
```

After adding or changing the environment variable in Vercel, redeploy the project.

The API key is configured in Vercel, not typed into the website by users.

## Notes

- The Gemini API key is only used in `api/generate.js`.
- Do not put real API keys in `index.html` or commit them to GitHub.
- Email output is normalized server-side to include a greeting and sign-off.
