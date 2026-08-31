import { SITE } from "@/data/site-config";

/**
 * Floating WhatsApp launcher, bottom-left, mirroring QuizPopup's
 * bottom-right position so the two sit as a pair and never collide.
 *
 * SITE.whatsappNumber is blank until a real WhatsApp Business number is
 * added to data/site-config.ts. Until then this safely routes to
 * /contact instead of guessing at a number, since sending a customer to
 * the wrong WhatsApp contact would be worse than not having the button.
 */
export default function WhatsAppButton() {
  const hasNumber = SITE.whatsappNumber.trim().length > 0;
  const href = hasNumber
    ? `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappDefaultMessage)}`
    : "/contact";

  return (
    <a
      href={href}
      target={hasNumber ? "_blank" : undefined}
      rel={hasNumber ? "noopener noreferrer" : undefined}
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-precision hover:scale-[1.06] cursor-pointer"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="white" aria-hidden="true">
        <path d="M16 .8C7.6.8.8 7.6.8 16c0 2.7.7 5.3 2 7.6L.8 31.2l7.8-2c2.2 1.2 4.7 1.9 7.4 1.9 8.4 0 15.2-6.8 15.2-15.1S24.4.8 16 .8zm0 27.6c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.6 1.2 1.2-4.5-.3-.5c-1.3-2-2-4.4-2-6.8C3.1 8.9 8.9 3.1 16 3.1S28.9 8.9 28.9 16 23.1 28.4 16 28.4zm7.1-9.3c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.5-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.3.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.3 6.8 6 .9.4 1.7.7 2.2.9.9.3 1.8.2 2.5.1.8-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.1-.3-.2-.9-.4z" />
      </svg>
    </a>
  );
}
