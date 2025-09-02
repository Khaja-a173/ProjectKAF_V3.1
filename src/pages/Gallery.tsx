import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCustomization } from "../hooks/useCustomization";
import DynamicPageRenderer from "../components/DynamicPageRenderer";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Heart,
  Share2,
  Play,
  Award,
  Users,
  ChefHat,
  Star,
} from "lucide-react";

export default function Gallery() {
  const { pages, theme, loading } = useCustomization({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const galleryPage = pages.find(
    (p) => p.slug === "gallery" && p.status === "published",
  );
  const hasCustomContent =
    galleryPage &&
    galleryPage.sections.length > 0 &&
    galleryPage.sections.some(
      (s) => s.visible && s.props && Object.keys(s.props).length > 0,
    );

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If tenant has customized the gallery page, render it dynamically
  if (hasCustomContent) {
    return (
      <div className="min-h-screen">
        <Header />
        <DynamicPageRenderer page={galleryPage} theme={theme} />
        <Footer />
      </div>
    );
  }

  // Original beautiful gallery design (unchanged)
  const categories = [
    { id: "all", name: "All Photos" },
    { id: "interiors", name: "Interiors" },
    { id: "food", name: "Food" },
    { id: "events", name: "Events" },
    { id: "staff", name: "Staff" },
  ];

  const galleryImages = [
    {
      id: 1,
      src: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Signature Risotto",
      description: "Our famous lobster risotto with saffron and microgreens",
      tags: ["signature", "seafood", "italian"],
    },
    {
      id: 2,
      src: "https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Grilled Salmon",
      description:
        "Fresh Atlantic salmon with herb crust and seasonal vegetables",
      tags: ["healthy", "seafood", "grilled"],
    },
    {
      id: 3,
      src: "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Wagyu Beef",
      description: "Premium wagyu beef tenderloin with truffle sauce",
      tags: ["premium", "beef", "truffle"],
    },
    {
      id: 4,
      src: "https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "interiors",
      title: "Main Dining Room",
      description:
        "Elegant dining space with warm ambiance and crystal chandeliers",
      tags: ["elegant", "dining", "luxury"],
    },
    {
      id: 5,
      src: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "interiors",
      title: "Private Dining",
      description: "Intimate private dining room for special occasions",
      tags: ["private", "intimate", "special"],
    },
    {
      id: 6,
      src: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Chocolate Dessert",
      description: "Decadent chocolate lava cake with vanilla ice cream",
      tags: ["dessert", "chocolate", "sweet"],
    },
    {
      id: 7,
      src: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Craft Cocktails",
      description: "Artisanal cocktails crafted by our expert mixologists",
      tags: ["cocktails", "drinks", "artisanal"],
    },
    {
      id: 8,
      src: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Fresh Ingredients",
      description: "Locally sourced, fresh ingredients prepared daily",
      tags: ["fresh", "local", "ingredients"],
    },
    {
      id: 9,
      src: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "staff",
      title: "Head Chef",
      description: "Chef Maria Rodriguez, our culinary mastermind",
      tags: ["chef", "team", "culinary"],
    },
    {
      id: 10,
      src: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "staff",
      title: "Kitchen Team",
      description: "Our talented culinary team at work",
      tags: ["team", "kitchen", "professional"],
    },
    {
      id: 11,
      src: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "events",
      title: "Wine Tasting",
      description: "Monthly wine tasting events with sommelier",
      tags: ["wine", "events", "tasting"],
    },
    {
      id: 12,
      src: "https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "food",
      title: "Italian Classics",
      description: "Traditional tiramisu made with authentic Italian recipe",
      tags: ["italian", "traditional", "dessert"],
    },
  ];

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(
        selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1,
      );
    }
  };

  const scrollToGallery = () => {
    document
      .getElementById("gallery-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const achievements = [
    { number: 10, suffix: "+", label: "Years of Excellence", icon: Award },
    { number: 50, suffix: "K+", label: "Happy Customers", icon: Users },
    { number: 100, suffix: "+", label: "Signature Dishes", icon: ChefHat },
    { number: 25, suffix: "+", label: "Industry Awards", icon: Star },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Section 1: Hero Video Banner */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            WELCOME TO BELLA VISTA GALLERY
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
            Experience the beauty, vibe, and timeless elegance.
          </p>
          <button
            onClick={scrollToGallery}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 animate-slide-up"
          >
            Explore Gallery →
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Photo Gallery */}
      <section id="gallery-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Gallery
            </h2>
            <p className="text-xl text-gray-600">
              A visual journey through our culinary world
            </p>
          </div>

          {/* Category Filters */}
          <div className="mb-12 flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105"
                    : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Masonry Gallery Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl break-inside-avoid"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                    <p className="text-sm text-gray-200 mb-3">
                      {image.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {image.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-white/20 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Fullscreen Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Our Achievements */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-pattern"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Achievements Counters */}
            <div>
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Our Achievements
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Celebrating milestones that define our excellence and commitment
                to culinary artistry.
              </p>

              <div className="grid grid-cols-2 gap-8">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <achievement.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                      {achievement.number}
                      {achievement.suffix}
                    </div>
                    <div className="text-gray-300 font-medium">
                      {achievement.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Showcase Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <img
                    src="https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Restaurant Interior"
                    className="w-full h-48 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                  <img
                    src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Signature Dish"
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-6 mt-12">
                  <img
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Wine Event"
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                  <img
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Chef Team"
                    className="w-full h-48 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Floating Award Badge */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="max-w-6xl max-h-full p-8 flex flex-col items-center">
            <img
              src={filteredImages[selectedImage].src}
              alt={filteredImages[selectedImage].title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Image Info */}
            <div className="text-center mt-6 text-white max-w-2xl">
              <h3 className="text-2xl font-bold mb-2">
                {filteredImages[selectedImage].title}
              </h3>
              <p className="text-gray-300 mb-4">
                {filteredImages[selectedImage].description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {filteredImages[selectedImage].tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Heart className="w-5 h-5" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            {selectedImage + 1} / {filteredImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
