export const pagesData = {
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
      "Choose a category and discover a small collection selected for happy, hands‑on learning.",
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
    sortOptions: [
      { label: "Featured", value: "featured" },
      { label: "Price: low to high", value: "price-low" },
      { label: "Price: high to low", value: "price-high" },
      { label: "Name: A–Z", value: "name" },
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
    form: {
      nameLabel: "Your name",
      emailLabel: "Email address",
      messageLabel: "How can we help?",
      submitLabel: "Send message",
      successTitle: "Message noted!",
      successMessage:
        "For the quickest reply, you can also message us on WhatsApp.",
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
        body: "When you use the demo account, cart, or checkout, information is stored locally in your browser. This may include your email, cart items, theme preference, and delivery details entered for a WhatsApp order.",
      },
      {
        title: "How we use it",
        body: "We use this information to keep your account session and cart working, calculate your order, and prepare the message you choose to send through WhatsApp.",
      },
      {
        title: "Payments and sharing",
        body: "This website does not process payments or store card details. Your order information is shared with our team only when you choose to open WhatsApp and send the prepared message.",
      },
      {
        title: "Your choices",
        body: "You can clear local data through your browser settings, remove items from your cart, or contact us at hello@atozkids.com with privacy questions.",
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
    disclaimer:
      "No transaction is processed on this website. Our team will reply to confirm everything.",
    successEyebrow: "Message ready",
    successTitle: "Your order request is ready!",
    successMessage:
      "WhatsApp opened with your order details. Our team will confirm availability, delivery, and payment directly with you.",
    successCta: "Continue shopping",
  },
};
