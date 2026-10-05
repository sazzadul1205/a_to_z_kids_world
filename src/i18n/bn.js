// Bangla (bn-BD) translation. Mirrors the shape of en.js exactly.
//
// Brand names, product names, and category names coming from the API are data
// rather than copy, so they are only translated where a mapping exists in
// `categories`. Numbers are formatted by Intl, which renders Bengali digits
// automatically for this locale.
const bn = {
  store: {
    brand: { primary: "A to Z", highlight: "কিডস" },
    tagline:
      "কৌতূহলী মনের জন্য একটি উজ্জ্বল ছোট্ট কোণ, সৃজনশীল খেলা আর প্রতিদিনের নতুন আবিষ্কারের জন্য।",
    announcement: "A to Z শপে অপেক্ষা করছে নতুন অভিযান",

    navLinks: [
      { name: "হোম", href: "/" },
      { name: "শপ", href: "/shop" },
      { name: "আমাদের সম্পর্কে", href: "/about" },
      { name: "যোগাযোগ", href: "/contact" },
    ],

    contact: {
      email: "hello@atozkids.com",
      phone: "+1 (555) 123-4567",
      address: "১২৩ লার্নিং লেন, এনইয়াই ১০০০১",
    },

    whatsapp: {
      number: "15551234567",
      message:
        "হ্যালো A to Z Kids World! আপনাদের খেলনা সম্পর্কে আরও জানতে চাই।",
    },

    footerColumns: [
      {
        title: "ঘুরে দেখুন",
        links: [
          { name: "আমাদের সম্পর্কে", href: "/about" },
          { name: "সব খেলনা", href: "/shop" },
          { name: "যোগাযোগ", href: "/contact" },
        ],
      },
      {
        title: "সহায়তা",
        links: [
          { name: "ডেলিভারি ও ফেরত", href: "/terms" },
          { name: "নিরাপত্তা ও গোপনীয়তা", href: "/privacy" },
          { name: "সাইট ম্যাপ", href: "/sitemap" },
        ],
      },
      {
        title: "আইনি",
        links: [
          { name: "গোপনীয়তা নীতি", href: "/privacy" },
          { name: "পরিষেবার শর্তাবলি", href: "/terms" },
          { name: "কুকি নীতি", href: "/privacy" },
        ],
      },
    ],

    // Brand handles on external platforms. Never translated.
    socials: [
      { name: "Facebook", href: "https://facebook.com" },
      { name: "Twitter", href: "https://twitter.com" },
      { name: "Instagram", href: "https://instagram.com" },
      { name: "YouTube", href: "https://youtube.com" },
    ],

    legal: {
      copyright: "A to Z Kids World. সর্বস্বত্ব সংরক্ষিত।",
      bottomLinks: [
        { name: "গোপনীয়তা", href: "/privacy" },
        { name: "শর্তাবলি", href: "/terms" },
        { name: "সাইট ম্যাপ", href: "/sitemap" },
      ],
    },

    checkout: {
      shippingFee: 60,
    },
  },

  pages: {
    hero: {
      badge: "কৌতূহলী মনের জন্য তৈরি",
      title: "হ্যালো, অভিযাত্রী!",
      subtitle: "আজকের দিনটিকে",
      highlight: "মজার করে তুলি।",
      description:
        "এমন খেলনা খুঁজে নিন যা প্রশ্নকে অভিযানে, ভাবনাকে সৃষ্টিতে আর সাধারণ বিকেলকে সুন্দর গল্পে রূপ দেয়।",
      image: "https://picsum.photos/seed/atozkids/800/600",
      imageAlt: "খেলার জন্য প্রস্তুত রঙিন খেলনা",
      imageBadge: "ভেতরে লুকিয়ে আছে বড় মজা!",
    },

    categories: {
      eyebrow: "একটি পথ বেছে নিন",
      title: "আজ কী দিয়ে খেলব?",
      description:
        "একটি ক্যাটাগরি বেছে নিন আর আনন্দময়, হাতে-কলমে শেখার জন্য বাছাই করা ছোট সংগ্রহটি দেখুন।",
      hint: "আরও দেখতে ক্যাটাগরিগুলো পাশে সরিয়ে দেখুন।",
    },

    products: {
      eyebrow: "অল্প বাছাই, বড় হাসি",
      fallbackTitle: "নির্বাচিত খেলনা",
      countSuffix: "আবিষ্কার",
      emptyTitle: "এই ক্যাটাগরিতে এখনো কোনো খেলনা নেই…",
      emptyMessage: "অন্য একটি ক্যাটাগরি বেছে নিন বা পুরো সংগ্রহ দেখুন।",
    },

    shop: {
      eyebrow: "সংগ্রহ দেখে নিন",
      title: "আপনার পরবর্তী পছন্দ খুঁজে নিন",
      intro:
        "সব আবিষ্কার একসাথে দেখুন, তারপর তালিকা সীমিত করুন যতক্ষণ না আপনার পছন্দের খেলনাটি চোখে পড়ে।",
      toExploreLabel: "দেখতে",
      searchPlaceholder: "খেলনা, দক্ষতা বা অভিযান খুঁজুন...",
      filtersButton: "ফিল্টার",
      refineTitle: "সীমিত করুন",
      resetLabel: "রিসেট",
      categoryLabel: "ক্যাটাগরি",
      priceLabel: "দাম",
      ageLabel: "বয়স",
      allAgesLabel: "সব বয়স",
      inStockLabel: "শুধু স্টকে আছে",
      sortLabel: "সাজান",
      closeLabel: "বন্ধ করুন",
      allDiscoveriesLabel: "সব আবিষ্কার",
      allToysLabel: "সব খেলনা",
      searchLabel: "পণ্য খুঁজুন",
      loading: "ক্যাটালগ লোড হচ্ছে...",
      catalogueError: "খেলনার ক্যাটালগ লোড করা যায়নি।",
      tryAgain: "আবার চেষ্টা করুন",
      // Bangla has no grammatical number distinction the way English does, so a
      // single form covers both counts.
      resultsOne: "{n}টি ফলাফল",
      resultsOther: "{n}টি ফলাফল",
      resultsIn: "{category}-এ",
      sortOptions: [
        { label: "বৈশিষ্ট্যযুক্ত", value: "featured" },
        { label: "দাম: কম থেকে বেশি", value: "price-low" },
        { label: "দাম: বেশি থেকে কম", value: "price-high" },
        { label: "নাম: অ–হ", value: "name" },
        { label: "সবচেয়ে বেশি স্টক", value: "stock" },
      ],
      priceOptions: [
        { label: "যেকোনো দাম", value: "all" },
        { label: "৳২,০০০-এর কম", value: "under-2000" },
        { label: "৳২,০০০–৳৪,০০০", value: "2000-4000" },
        { label: "৳৪,০০০-এর বেশি", value: "over-4000" },
      ],
    },

    about: {
      eyebrow: "আমাদের গল্প",
      title: "খেলাই বড় ভাবনার শুরু।",
      intro:
        "A to Z Kids World এমন ভাবনাশীল খেলনা নিয়ে একত্রে হয়েছে, যা শিশুদের কৌতূহলী করে, গড়তে, বানাতে ও বেড়ে উঠতে সাহায্য করে। প্রতিটি আবিষ্কার এমনভাবে বেছে নেওয়া হয় যাতে শেখা মনে হয় একটি মজার অভিযান।",
      stats: [
        {
          value: "২১+",
          label: "বাছাই করা আবিষ্কার",
          note: "সৃজনশীল খেলার জন্য ক্রমবর্ধমান সংগ্রহ।",
          tone: "primary",
        },
        {
          value: "১০০%",
          label: "কৌতূহলী অনুমোদিত",
          note: "হাতে-কলমে মজার জন্য বাছাই করা পণ্য।",
          tone: "accent",
        },
        {
          value: "১",
          label: "আনন্দের লক্ষ্য",
          note: "প্রতিটি খেলার সময়কে গুরুত্বপূর্ণ করা।",
          tone: "secondary",
        },
      ],
      feature: {
        title: "বেড়ে ওঠা মনের জন্য",
        body: "প্রথম পাজল থেকে বড় STEM পরীক্ষা-নিরীক্ষা পর্যন্ত, আমাদের সংগ্রহ এমন খেলায় উৎসাহিত করে যা আত্মবিশ্বাস, কল্পনা ও যোগাযোগ গড়ে তোলে।",
        points: [
          "বয়স অনুযায়ী সুপারিশ",
          "হোয়াটসঅ্যাপে বন্ধুত্বপূর্ণ সহায়তা",
          "স্থানীয় ও সহজ অর্ডারের অভিজ্ঞতা",
        ],
      },
    },

    contact: {
      eyebrow: "আমরা সাহায্য করতে এখানে",
      title: "খেলা নিয়ে কথা বলি।",
      intro:
        "পণ্য, ডেলিভারি বা সঠিক আবিষ্কার বাছাই নিয়ে কোনো প্রশ্ন আছে? আমাদের লিখুন, আমাদের দল দ্রুত উত্তর দেবে।",
      panelTitle: "যোগাযোগের তথ্য",
      panelNote:
        "আমাদের বন্ধুত্বপূর্ণ দল আপনার পরবর্তী সঠিক অভিযান খুঁজে দিতে প্রস্তুত।",
      ctaLabel: "হোয়াটসঅ্যাপ খুলুন",
      whatsappLabel: "হোয়াটসঅ্যাপে আমাদের সাথে কথা বলুন",
      form: {
        nameLabel: "আপনার নাম",
        emailLabel: "ইমেল ঠিকানা",
        messageLabel: "কীভাবে সাহায্য করতে পারি?",
        submitLabel: "হোয়াটসঅ্যাপে পাঠান",
        successTitle: "বার্তা প্রস্তুত!",
        successMessage:
          "আপনার বার্তাসহ হোয়াটসঅ্যাপ খোলা হয়েছে। আমাদের দল শীঘ্রই সেখানে উত্তর দেবে।",
      },
    },

    privacy: {
      eyebrow: "আপনার গোপনীয়তা",
      title: "গোপনীয়তা নীতি",
      intro:
        "সর্বশেষ হালনাগাদ: ৩ সেপ্টেম্বর, ২০২৬। এই সরল নীতিটি ব্যাখ্যা করে A to Z Kids World কোন তথ্য ব্যবহার করে এই স্থানীয় কেনাকাটার অভিজ্ঞতা প্রদান করে।",
      sections: [
        {
          title: "আমরা যে তথ্য ব্যবহার করি",
          body: "এই শপ ব্রাউজ করতে কোনো অ্যাকাউন্ট লাগে না। আপনার বাস্কেট ও থিম পছন্দ আপনার ব্রাউজারে স্থানীয়ভাবে সংরক্ষিত থাকে, এবং আপনার লেখা ডেলিভারি তথ্য শুধুমাত্র আপনার পাঠানো হোয়াটসঅ্যাপ বার্তা তৈরি করতে ব্যবহৃত হয়। কর্মীদের জন্য আলাদা সাইন-ইন একটি স্বল্পমেয়াদি সেশন টোকেন সংরক্ষণ করে, যা শুধু অনুমোদিত প্রশাসকের ব্রাউজারেই থাকে।",
        },
        {
          title: "আমরা কীভাবে ব্যবহার করি",
          body: "আপনার বাস্কেট কার্যকর রাখতে, বর্তমান ক্যাটালগ দেখাতে, অর্ডার সারসংক্ষেপ হিসাব করতে এবং হোয়াটসঅ্যাপে পাঠানো বার্তা প্রস্তুত করতে এই তথ্য ব্যবহার করি। আপনার দেওয়া রিভিউয়ের নাম ও মন্তব্য পণ্যের পাতায় প্রকাশিত হয়।",
        },
        {
          title: "পেমেন্ট ও ভাগ করা",
          body: "এই ওয়েবসাইট কোনো পেমেন্ট প্রক্রিয়া করে না এবং কার্ডের তথ্য সংরক্ষণ করে না। আপনি হোয়াটসঅ্যাপ খুলে প্রস্তুত বার্তা পাঠানোর সময়ই কেবল আমাদের দলের সাথে আপনার অর্ডারের তথ্য ভাগ হয়।",
        },
        {
          title: "আপনার পছন্দ",
          body: "আপনি ব্রাউজারের সেটিংস থেকে স্থানীয় ডেটা মুছে ফেলতে পারেন, বাস্কেট থেকে পণ্য সরাতে পারেন, অথবা গোপনীয়তা সংক্রান্ত প্রশ্নে hello@atozkids.com ঠিকানায় যোগাযোগ করতে পারেন।",
        },
      ],
    },

    terms: {
      eyebrow: "বন্ধুত্বপূর্ণ সূক্ষ্ম লেখা",
      title: "পরিষেবার শর্তাবলি",
      intro:
        "A to Z Kids World ব্যবহার করে আপনি সম্মতি দিচ্ছেন যে আপনি এই ওয়েবসাইট দায়িত্বের সাথে ব্যবহার করবেন এবং অর্ডার আমাদের দলের সাথে সরাসরি নিশ্চিত হয়।",
      sections: [
        {
          title: "সাইট ব্যবহার",
          body: "পণ্য ব্রাউজ করতে, স্থানীয় কার্ট পরিচালনা করতে এবং অর্ডারের অনুরোধ পাঠাতে ওয়েবসাইটটি ব্যবহার করুন। আমাদের দলের সাথে যোগাযোগের সময় সঠিক যোগাযোগ ও ডেলিভারি তথ্য দিন।",
        },
        {
          title: "অর্ডার ও পেমেন্ট",
          body: "কোনো পণ্য যোগ করা বা হোয়াটসঅ্যাপ খোলা স্টক নিশ্চিত করে না এবং সম্পূর্ণ বিক্রয় তৈরি করে না। আমাদের দল আপনার সাথে সরাসরি স্টক, ডেলিভারি খরচ, পেমেন্ট পদ্ধতি ও চূড়ান্ত অর্ডারের বিবরণ নিশ্চিত করে।",
        },
        {
          title: "পণ্যের তথ্য",
          body: "পণ্যের বিবরণ, দাম, ছবি ও বয়সসংক্রান্ত নির্দেশনা সঠিক রাখাই আমাদের লক্ষ্য। সংগ্রহ বাড়ার সাথে সাথে বিবরণ পরিবর্তিত হতে পারে।",
        },
        {
          title: "যোগাযোগ",
          body: "অর্ডার বা এই শর্তাবলি সংক্রান্ত প্রশ্ন hello@atozkids.com ঠিকানায় অথবা হোয়াটসঅ্যাপে পাঠাতে পারেন।",
        },
      ],
    },

    sitemap: {
      eyebrow: "পথ খুঁজে নিন",
      title: "সাইট ম্যাপ",
      intro: "A to Z Kids World-এ বর্তমানে উপলব্ধ সবকিছু।",
      links: [
        { name: "হোম", href: "/" },
        { name: "সব খেলনা দেখুন", href: "/shop" },
        { name: "আমাদের সম্পর্কে", href: "/about" },
        { name: "যোগাযোগ", href: "/contact" },
        { name: "গোপনীয়তা নীতি", href: "/privacy" },
        { name: "পরিষেবার শর্তাবলি", href: "/terms" },
      ],
    },

    notFound: {
      code: "404",
      title: "খেলনাটি হারিয়ে গেছে!",
      message:
        "ওহ! আপনি যে পাতাটি খুঁজছেন সেটি খেলতে চলে গেছে। চলুন আপনাকে বাড়ি ফিরিয়ে দিই।",
      ctaLabel: "হোমে ফিরে যান",
      mascot: "🧸",
      marker: "❓",
      decorations: ["🎈", "🎪", "🎠", "🪁"],
    },

    checkout: {
      eyebrow: "প্রায় শেষ",
      title: "আমরা কোথায় পৌঁছে দেব?",
      intro:
        "এখানে কার্ডের কোনো তথ্য লাগবে না। আমরা হোয়াটসঅ্যাপে নিরাপদে কথোপকথন চালিয়ে যাব।",
      addressTitle: "ডেলিভারি ঠিকানা",
      fields: {
        name: "পূর্ণ নাম",
        line: "রাস্তার ঠিকানা",
        linePlaceholder: "১২৩ লার্নিং লেন",
        city: "শহর",
        postal: "পোস্ট কোড",
      },
      summaryTitle: "অর্ডার সারসংক্ষেপ",
      emptyBasket:
        "আপনার বাস্কেট খালি। মজার কিছু বেছে নিতে শপে ফিরে যান।",
      subtotalLabel: "সাবটোটাল",
      shippingLabel: "ডেলিভারি",
      totalLabel: "সর্বমোট",
      submitLabel: "হোয়াটসঅ্যাপে অর্ডার পাঠান",
      emptySubmitLabel: "আপনার বাস্কেট খালি",
      backToShopping: "কেনাকাটায় ফিরে যান",
      confirmedOnWhatsApp: "ডেলিভারি হোয়াটসঅ্যাপে নিশ্চিত করা হয়েছে",
      noPaymentStored: "কোনো পেমেন্ট তথ্য সংরক্ষিত হয় না",
      disclaimer:
        "এই ওয়েবসাইটে কোনো লেনদেন প্রক্রিয়া করা হয় না। সবকিছু নিশ্চিত করতে আমাদের দল উত্তর দেবে।",
      successEyebrow: "বার্তা প্রস্তুত",
      successTitle: "আপনার অর্ডারের অনুরোধ প্রস্তুত!",
      successMessage:
        "আপনার অর্ডারের বিবরণসহ হোয়াটসঅ্যাপ খোলা হয়েছে। স্টক, ডেলিভারি ও পেমেন্ট আপনার সাথে সরাসরি নিশ্চিত করা হবে।",
      successCta: "কেনাকাটা চালিয়ে যান",
    },
  },

  ui: {
    nav: {
      searchPlaceholder: "পণ্য খুঁজুন...",
      cart: "কেনাকাটার ঝুড়ি",
      themeToLight: "উজ্জ্বল থিমে যান",
      themeToDark: "অন্ধকার থিমে যান",
      menuOpen: "মেনু খুলুন",
      menuClose: "মেনু বন্ধ করুন",
      switchToBangla: "বাংলায় দেখুন",
      switchToEnglish: "ইংরেজিতে দেখুন",
    },

    footer: {
      followUs: "আমাদের অনুসরণ করুন:",
      visitUsOn: "{name}-এ আমাদের দেখুন",
    },

    cart: {
      yourPicks: "আপনার পছন্দ",
      basket: "কেনাকাটার ঝুড়ি",
      close: "কেনাকাটার ঝুড়ি বন্ধ করুন",
      emptyTitle: "আপনার বাস্কেট মজার জন্য প্রস্তুত",
      emptyMessage: "শপ থেকে কিছু যোগ করুন, তাহলে তা এখানে দেখা যাবে।",
      continueShopping: "কেনাকাটা চালিয়ে যান",
      removeItem: "{name} সরান",
      decrease: "পরিমাণ কমান",
      increase: "পরিমাণ বাড়ান",
      subtotal: "সাবটোটাল",
      whatsappNote: "ডেলিভারি ও চূড়ান্ত দাম হোয়াটসঅ্যাপে নিশ্চিত করা হয়।",
      checkout: "চেকআউট",
    },

    notice: {
      dismiss: "বার্তা বাদ দিন",
      added: "{name} আপনার বাস্কেটে যোগ হয়েছে।",
      allInStock: "স্টকে আমাদের কাছে এই {name}-ই শেষ।",
      outOfStock: "{name} স্টকে নেই।",
      outOfStockFallback: "এই খেলনাটি স্টকে নেই।",
    },

    hero: {
      chatWithUs: "আমাদের সাথে কথা বলুন",
      shopNow: "এখনই কিনুন",
    },

    categories: {
      allToys: "সব খেলনা",
    },

    products: {
      soldOut: "স্টকে নেই",
      buyNow: "এখনই কিনুন",
    },

    modal: {
      close: "পণ্যের বিবরণ বন্ধ করুন",
      noRatingsYet: "এখনো কোনো রেটিং নেই",
      suitableFor: "{age}-এর জন্য উপযুক্ত",
      includes: "রয়েছে {includes}",
      freeDelivery: "এই আবিষ্কারে বিনামূল্যে ডেলিভারি",
      ourPrice: "আমাদের দাম",
      outOfStock: "স্টকে নেই",
      inStock: "{stock}টি স্টকে আছে",
      easyReturns: "৩০ দিনের মধ্যে সহজে ফেরত",
      safeCheckout: "নিরাপদ চেকআউট ও মান যাচাই করা খেলনা",
      addToCart: "বাস্কেটে যোগ করুন",
      buyNow: "এখনই কিনুন",
      reviewsHeading: "পরিবারের মতামত",
      loadingReviews: "রিভিউ লোড হচ্ছে...",
      noReviews: "এখনো কোনো রিভিউ নেই। প্রথম মতামতটি আপনিই দিন।",
      leaveReview: "রিভিউ দিন",
      yourName: "আপনার নাম",
      namePlaceholder: "উদাহরণ: আলেক এক্সপ্লোরার",
      rating: "রেটিং",
      ratingStarsOne: "{n} তারা",
      ratingStarsOther: "{n} তারা",
      comment: "মন্তব্য",
      commentPlaceholder: "আপনার ছোট্টটির কী মনে হলো?",
      published: "ধন্যবাদ! আপনার রিভিউ প্রকাশিত হয়েছে।",
      publishing: "প্রকাশ হচ্ছে...",
      publishReview: "রিভিউ প্রকাশ করুন",
    },
  },

  messages: {
    order: {
      greeting: "হ্যালো! আমি একটি অর্ডার করতে চাই।",
      item: "• {name} x{n} - {total} (রেফ {id})",
      subtotal: "সাবটোটাল: {value}",
      delivery: "ডেলিভারি: {value}",
      total: "সর্বমোট: {value}",
      deliverTo: "ডেলিভারি: {address}",
    },
    contact: {
      greeting: "হ্যালো A to Z Kids World!",
      name: "নাম: {value}",
      email: "ইমেল: {value}",
      message: "বার্তা: {value}",
    },
  },

  categories: {
    "Building blocks": "বিল্ডিং ব্লক",
    "Arts & crafts": "কলা ও শিল্প",
    "Outdoor play": "বাইরের খেলা",
    "STEM toys": "এসটিইএম খেলনা",
    "Board games": "বোর্ড গেম",
    "Plush friends": "নরম বন্ধু",
    Puzzles: "পাজল",
  },
};

export default bn;