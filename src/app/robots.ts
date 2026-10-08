import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt (generated). Itqan WANTS to be discovered, cited and recommended by
 * AI answer engines, so we explicitly welcome every major AI crawler — both the
 * search/retrieval bots (which decide AI-answer citations) and the training bots
 * (which build the model's entity knowledge of the brand). Each operator runs
 * several bots and many only read their own user-agent block, so we enumerate
 * them rather than relying on the `*` rule alone.
 */
export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = [
    // OpenAI / ChatGPT
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    // Anthropic / Claude
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'anthropic-ai',
    // Perplexity
    'PerplexityBot',
    'Perplexity-User',
    // Google Gemini / AI Overviews, Apple, Microsoft, Common Crawl
    'Google-Extended',
    'Applebot-Extended',
    'Bingbot',
    'CCBot',
  ];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/book/cancel/', '/ar/book/cancel/'] },
      { userAgent: aiCrawlers, allow: '/', disallow: ['/api/', '/admin', '/book/cancel/', '/ar/book/cancel/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
