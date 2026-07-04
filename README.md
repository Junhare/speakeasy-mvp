# SpeakEasy MVP

SpeakEasy is an AI expression assistant for Chinese international students. It helps users turn Chinese or mixed-language thoughts into simple, natural, advisor-ready English expressions.

This project is a single-page website with a Vercel Serverless API route.

## Files

- `index.html` - frontend website and interaction UI
- `api/generate.js` - Vercel Serverless Function that calls Gemini

## Deployment

Deploy this repository on Vercel.

Required environment variable:

```text
GEMINI_API_KEY=your_gemini_api_key
```

After adding or changing the environment variable in Vercel, redeploy the project.

## Notes

- The Gemini API key is only used in `api/generate.js`.
- Do not put real API keys in `index.html` or commit them to GitHub.
- Email output is normalized server-side to include a greeting and sign-off.
