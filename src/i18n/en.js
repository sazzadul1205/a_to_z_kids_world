// English is the source locale. Every other locale file mirrors this shape
// exactly, so a missing key shows up as a shape error rather than a runtime blank.
//
// `store` and `pages` were previously src/data/store.js and src/data/pages.js.
// `ui` holds strings that used to be hardcoded inside components.
//
// Literal names (nav links, option labels, stat labels) are repeated per locale
// rather than keyed, because the whole object is already per-locale and this
// keeps consumers unchanged. Only genuinely dynamic values need indirection.
const en = {
  store: {
    brand: { primary: "A to Z", highlight: "Kids" },
    tagline:
      "A bright little corner for curious minds, creative play, and everyday discoveries.",
    announcement: "New adventures are waiting in the A to Z shop",

    navLinks: [
      { name: "Home", href: "/" },
      { name: "Shop", href: "/shop" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],

    contact: {
      email: "hello@atozkids.com",
      phone: "+1 (555) 123-4567",
      address: "123 Learning Lane, NY 10001",
    },

    whatsapp: {
      number: "15551234567",
      message: "Hi A to Z Kids World! I would like to know more about your toys.",
    },

    footerColumns: [
      {
        title: "Explore",
        links: [
          { name: "About Us", href: "/about" },
          { name: "All Toys", href: "/shop" },
          { name: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Help",
        links: [
          { name: "Delivery & Returns", href: "/terms" },
          { name: "Safety & Privacy", href: "/privacy" },
          { name: "Site Map", href: "/sitemap" },
        ],
      },
      {
        title: "Legal",
        links: [
          { name: "Privacy Policy", href: "/privacy" },
          { name: "Terms of Service", href: "/terms" },
          { name: "Cookie Policy", href: "/privacy" },
        ],
      },
    ],

    // Names double as icon keys, so they are identifiers and never translated.
    socials: [
      { name: "Facebook", href: "https://facebook.com" },
      { name: "Twitter", href: "https://twitter.com" },
      { name: "Instagram", href: "https://instagram.com" },
      { name: "YouTube", href: "https://youtube.com" },
    ],

    legal: {
      copyright: "A to Z Kids World. All rights reserved.",
      bottomLinks: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Sitemap", href: "/sitemap" },
      ],
    },

    checkout: {
      shippingFee: 60,
    },
  },

  pages: {
    hero: {
      badge: "Made for curious minds",
      title: "Hello, explorer!",
      subtitle: "Let's make today",
      highlight: "playful.",
      description:
        "Find toys that turn questions into adventures, ideas into creations, and ordinary afternoons into wonderful stories.",
      image: "https://picsum.photos/seed/atozkids/800/600",
      imageAlt: "Colorful toys ready for play",
      imageBadge: "Big fun inside!",
    },

    categories: {
      eyebrow: "Pick a path",
      title: "What are we playing today?",
      description:
        "Choose a category and discover a small collection selected for happy, hands-on learning.",
      hint: "Drag the categories sideways to explore more.",
    },

    products: {
      eyebrow: "Little picks, big smiles",
      fallbackTitle: "Featured playthings",
      countSuffix: "discoveries",
      emptyTitle: "No toys in this category… yet!",
      emptyMessage: "Try another category or browse the full collection.",
    },

    shop: {
      eyebrow: "Explore the collection",
      title: "Find your next favorite",
      intro:
        "Browse every discovery in one place, then narrow the list until the perfect plaything appears.",
      toExploreLabel: "to explore",
      searchPlaceholder: "Search toys, skills, or adventures...",
      filtersButton: "Filters",
      refineTitle: "Refine",
      resetLabel: "Reset",
      categoryLabel: "Category",
      priceLabel: "Price",
      ageLabel: "Age group",
      allAgesLabel: "All ages",
      inStockLabel: "In stock only",
      sortLabel: "Sort",
      closeLabel: "Close",
      allDiscoveriesLabel: "All discoveries",
      allToysLabel: "All toys",
      searchLabel: "Search products",
      loading: "Loading the catalogue...",
      catalogueError: "We could not load the toy catalogue.",
      tryAgain: "Try again",
      resultsOne: "{n} result",
      resultsOther: "{n} results",
      resultsIn: "in {category}",
      sortOptions: [
        { label: "Featured", value: "featured" },
        { label: "Price: low to high", value: "price-low" },
        { label: "Price: high to low", value: "price-high" },
        { label: "Name: A–Z", value: "name" },
        // Was hardcoded in the component rather than listed with its siblings.
        { label: "Most in stock", value: "stock" },
      ],
      priceOptions: [
        { label: "Any price", value: "all" },
        { label: "Under ৳2,000", value: "under-2000" },
        { label: "৳2,000–৳4,000", value: "2000-4000" },
        { label: "Over ৳4,000", value: "over-4000" },
      ],
    },

    about: {
      eyebrow: "Our story",
      title: "Play is how big ideas begin.",
      intro:
        "A to Z Kids World brings together thoughtful toys that help children wonder, build, make, and grow. Every discovery is chosen to make learning feel like an adventure.",
      stats: [
        {
          value: "21+",
          label: "Curated discoveries",
          note: "A growing collection for creative play.",
          tone: "primary",
        },
        {
          value: "100%",
          label: "Curiosity approved",
          note: "Products selected for hands-on fun.",
          tone: "accent",
        },
        {
          value: "1",
          label: "Happy mission",
          note: "Make every playtime count.",
          tone: "secondary",
        },
      ],
      feature: {
        title: "Made for growing minds",
        body: "From first puzzles to big STEM experiments, our collection is designed to invite children into the kind of play that builds confidence, imagination, and connection.",
        points: [
          "Age-conscious recommendations",
          "Friendly support through WhatsApp",
          "Local, simple ordering experience",
        ],
      },
    },

    contact: {
      eyebrow: "We are here to help",
      title: "Let's talk about play.",
      intro:
        "Have a question about a product, delivery, or choosing the right discovery? Send us a note and our team will get back to you.",
      panelTitle: "Contact details",
      panelNote:
        "Our friendly team is ready to help you find the right next adventure.",
      ctaLabel: "Open WhatsApp",
      whatsappLabel: "Chat with us on WhatsApp",
      form: {
        nameLabel: "Your name",
        emailLabel: "Email address",
        messageLabel: "How can we help?",
        submitLabel: "Send via WhatsApp",
        successTitle: "Message ready!",
        successMessage:
          "WhatsApp opened with your message. Our team will reply there shortly.",
      },
    },

    privacy: {
      eyebrow: "Your privacy",
      title: "Privacy Policy",
      intro:
        "Last updated September 3, 2026. This simple policy explains what information A to Z Kids World uses to provide this local shopping experience.",
      sections: [
        {
          title: "Information we use",
          body: "Browsing this shop does not require an account. Your basket and theme preference are stored locally in your browser, and any delivery details you type are used only to build the WhatsApp message you choose to send. A separate staff-only sign-in stores a short-lived session token in the browser of an authorised administrator.",
        },
        {
          title: "How we use it",
          body: "We use this information to keep your basket working, display the current catalogue, calculate your order summary, and prepare the message you send through WhatsApp. Review names and comments you submit are published on the product page.",
        },
        {
          title: "Payments and sharing",
          body: "This website does not process payments or store card details. Your order information is shared with our team only when you choose to open WhatsApp and send the prepared message.",
        },
        {
          title: "Your choices",
          body: "You can clear local data through your browser settings, remove items from your basket, or contact us at hello@atozkids.com with privacy questions.",
        },
      ],
    },

    terms: {
      eyebrow: "The friendly fine print",
      title: "Terms of Service",
      intro:
        "By using A to Z Kids World, you agree to use this website responsibly and understand that orders are confirmed directly with our team.",
      sections: [
        {
          title: "Using the site",
          body: "Use the website to browse products, manage a local cart, and send an order request. Please provide accurate contact and delivery information when contacting our team.",
        },
        {
          title: "Orders and payment",
          body: "Adding an item or opening WhatsApp does not guarantee availability or create a completed sale. Our team confirms availability, delivery cost, payment method, and final order details directly with you.",
        },
        {
          title: "Product information",
          body: "We aim to keep product descriptions, prices, images, and age guidance accurate. Details may change as our collection grows.",
        },
        {
          title: "Contact",
          body: "Questions about an order or these terms can be sent to hello@atozkids.com or through WhatsApp.",
        },
      ],
    },

    sitemap: {
      eyebrow: "Find your way",
      title: "Sitemap",
      intro: "Everything currently available in A to Z Kids World.",
      links: [
        { name: "Home", href: "/" },
        { name: "Shop all toys", href: "/shop" },
        { name: "About us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy policy", href: "/privacy" },
        { name: "Terms of service", href: "/terms" },
      ],
    },

    notFound: {
      code: "404",
      title: "Toy Lost Its Way!",
      message:
        "Oops! The page you're looking for has wandered off to play. Let's get you back home.",
      ctaLabel: "Back to Home",
      mascot: "🧸",
      marker: "❓",
      decorations: ["🎈", "🎪", "🎠", "🪁"],
    },

    checkout: {
      eyebrow: "Almost there",
      title: "Where should we deliver?",
      intro:
        "No card details are needed here. We'll continue the conversation safely on WhatsApp.",
      addressTitle: "Delivery address",
      fields: {
        name: "Full name",
        line: "Street address",
        linePlaceholder: "123 Learning Lane",
        city: "City",
        postal: "Postal code",
      },
      summaryTitle: "Order summary",
      emptyBasket:
        "Your basket is empty. Return to the shop to choose something fun.",
      subtotalLabel: "Subtotal",
      shippingLabel: "Delivery",
      totalLabel: "Total",
      submitLabel: "Send order on WhatsApp",
      emptySubmitLabel: "Your basket is empty",
      backToShopping: "Back to shopping",
      confirmedOnWhatsApp: "Delivery confirmed on WhatsApp",
      noPaymentStored: "No payment details stored",
      disclaimer:
        "No transaction is processed on this website. Our team will reply to confirm everything.",
      successEyebrow: "Message ready",
      successTitle: "Your order request is ready!",
      successMessage:
        "WhatsApp opened with your order details. Our team will confirm availability, delivery, and payment directly with you.",
      successCta: "Continue shopping",
    },
  },

  // Strings that were inline in components.
  ui: {
    nav: {
      searchPlaceholder: "Search products...",
      cart: "Shopping basket",
      themeToLight: "Switch to light theme",
      themeToDark: "Switch to dark theme",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      switchToBangla: "Switch to Bangla",
      switchToEnglish: "Switch to English",
    },

    footer: {
      followUs: "Follow us:",
      visitUsOn: "Visit us on {name}",
    },

    cart: {
      yourPicks: "Your picks",
      basket: "Shopping basket",
      close: "Close shopping basket",
      emptyTitle: "Your basket is ready for fun",
      emptyMessage: "Add a discovery from the shop and it will appear here.",
      continueShopping: "Continue shopping",
      removeItem: "Remove {name}",
      decrease: "Decrease quantity",
      increase: "Increase quantity",
      subtotal: "Subtotal",
      whatsappNote: "Delivery and final pricing are confirmed on WhatsApp.",
      checkout: "Checkout",
    },

    notice: {
      dismiss: "Dismiss message",
      added: "{name} added to your basket.",
      allInStock: "That is every {name} we have in stock.",
      outOfStock: "{name} is out of stock.",
      outOfStockFallback: "That toy is out of stock.",
    },

    hero: {
      chatWithUs: "Chat with us",
      shopNow: "Shop now",
    },

    categories: {
      allToys: "All toys",
    },

    products: {
      soldOut: "Sold out",
      buyNow: "Buy now",
    },

    modal: {
      close: "Close product details",
      noRatingsYet: "No ratings yet",
      suitableFor: "Suitable for {age}",
      includes: "Includes {includes}",
      freeDelivery: "Free delivery on this discovery",
      ourPrice: "Our price",
      outOfStock: "Out of stock",
      inStock: "{stock} in stock",
      easyReturns: "Easy returns within 30 days",
      safeCheckout: "Safe checkout and quality-checked toys",
      addToCart: "Add to cart",
      buyNow: "Buy now",
      reviewsHeading: "What families say",
      loadingReviews: "Loading reviews...",
      noReviews: "No reviews yet. Be the first to share what you think.",
      reviewsDisabled: "Reviews are disabled for this store.",
      leaveReview: "Leave a review",
      yourName: "Your name",
      namePlaceholder: "Alex Explorer",
      rating: "Rating",
      ratingStarsOne: "{n} star",
      ratingStarsOther: "{n} stars",
      comment: "Comment",
      commentPlaceholder: "What did your little one think?",
      published: "Thanks! Your review has been published.",
      publishing: "Publishing...",
      publishReview: "Publish review",
    },
  },

  // Copy the visitor sends to the team, so it follows their language.
  messages: {
    order: {
      greeting: "Hello! I would like to place an order.",
      item: "• {name} x{n} - {total} (ref {id})",
      subtotal: "Subtotal: {value}",
      delivery: "Delivery: {value}",
      total: "Total: {value}",
      deliverTo: "Deliver to: {address}",
    },
    contact: {
      greeting: "Hello A to Z Kids World!",
      name: "Name: {value}",
      email: "Email: {value}",
      message: "Message: {value}",
    },
  },

  // Category names arrive from the API in English, so this maps an incoming name
  // to its translation. Unmapped names fall back to what the API sent, which is
  // what keeps newly added categories working without a code change.
  categories: {
    "Building blocks": "Building blocks",
    "Arts & crafts": "Arts & crafts",
    "Outdoor play": "Outdoor play",
    "STEM toys": "STEM toys",
    "Board games": "Board games",
    "Plush friends": "Plush friends",
    Puzzles: "Puzzles",
  },
};

export default en;