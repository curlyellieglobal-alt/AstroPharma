/**
 * FAQ Schema Structured Data
 * Generates JSON-LD schema for FAQ pages to improve search results
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchema {
  "@context": string;
  "@type": string;
  mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }>;
}

/**
 * Generate FAQ Schema JSON-LD
 */
export function generateFAQSchema(faqs: FAQItem[]): FAQSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Inject FAQ Schema into page head
 */
export function injectFAQSchema(faqs: FAQItem[]) {
  if (typeof document === "undefined") return;

  // Remove existing FAQ schema if present
  const existingSchema = document.querySelector(
    'script[type="application/ld+json"][data-type="faq"]'
  );
  if (existingSchema) {
    existingSchema.remove();
  }

  // Create and inject new schema
  const schema = generateFAQSchema(faqs);
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-type", "faq");
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Sample FAQs for hair care products
 */
export const SAMPLE_FAQS: FAQItem[] = [
  {
    question: "How often should I use CurlyEllie hair lotion?",
    answer:
      "For best results, apply CurlyEllie hair lotion 2-3 times per week to damp hair. You can use it more frequently if your hair is very dry or damaged. Always apply to the mid-lengths and ends of your hair, avoiding the scalp.",
  },
  {
    question: "Is CurlyEllie suitable for all hair types?",
    answer:
      "CurlyEllie is specifically formulated for curly and wavy hair. It works best on hair types 2C to 4C. If you have straight hair, you may find it too heavy, but some people with wavy hair love the extra moisture and definition.",
  },
  {
    question: "Can I use CurlyEllie with other hair products?",
    answer:
      "Yes! CurlyEllie works well with other hair care products. For best results, use it with a sulfate-free shampoo and a leave-in conditioner. Avoid mixing with silicone-based products as they may cause buildup.",
  },
  {
    question: "How long does one bottle of CurlyEllie last?",
    answer:
      "One 250ml bottle typically lasts 2-3 months with regular use (2-3 times per week). The exact duration depends on your hair length, thickness, and how much product you use per application.",
  },
  {
    question: "Is CurlyEllie safe for color-treated hair?",
    answer:
      "Absolutely! CurlyEllie is safe for color-treated hair. In fact, it helps maintain color vibrancy and prevents fading. The nourishing ingredients help protect your hair from damage caused by coloring treatments.",
  },
  {
    question: "What are the main ingredients in CurlyEllie?",
    answer:
      "CurlyEllie contains natural ingredients including argan oil, shea butter, coconut oil, and vitamin E. These ingredients work together to moisturize, define curls, and reduce frizz without harsh chemicals.",
  },
  {
    question: "Can men use CurlyEllie?",
    answer:
      "Yes! CurlyEllie is suitable for anyone with curly or wavy hair, regardless of gender. Men with curly hair will benefit from the same moisturizing and defining properties as women.",
  },
  {
    question: "How do I know if CurlyEllie is right for my hair?",
    answer:
      "If your hair is curly, wavy, or coily and tends to be dry or frizzy, CurlyEllie is likely a good choice. We recommend starting with a small amount to test how your hair responds. Most customers see improvements in curl definition and moisture within 2-3 applications.",
  },
];
