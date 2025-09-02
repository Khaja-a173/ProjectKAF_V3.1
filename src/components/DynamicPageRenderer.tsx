import { Page, PageSection } from "../types/customization";
import {
  Award,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

interface DynamicPageRendererProps {
  page: Page;
  theme?: any;
}

export default function DynamicPageRenderer({
  page,
  theme,
}: DynamicPageRendererProps) {
  const renderSection = (section: PageSection) => {
    if (!section.visible) return null;

    switch (section.type) {
      case "hero_video":
        return (
          <section
            key={section.id}
            className="relative h-screen flex items-center justify-center overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 z-10"
              style={{ opacity: section.props.overlayOpacity || 0.5 }}
            ></div>
            {section.props.videoUrl ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src={section.props.videoUrl}
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1920)",
                }}
              />
            )}

            <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                {section.props.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
                {section.props.subheadline}
              </p>
              {section.props.cta && (
                <a
                  href={section.props.cta.href}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 animate-slide-up inline-block"
                >
                  {section.props.cta.label}
                </a>
              )}
            </div>
          </section>
        );

      case "achievements_counters":
        return (
          <section
            key={section.id}
            className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-pattern"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {section.props.items?.map((achievement: any, index: number) => (
                  <div key={index} className="text-center group">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                      {achievement.value}
                      {achievement.suffix}
                    </div>
                    <div className="text-gray-300 font-medium">
                      {achievement.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "image_gallery":
        return (
          <section key={section.id} className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {section.props.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl break-inside-avoid"
                  >
                    <img
                      src={item.asset?.url}
                      alt={item.caption}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-xl font-bold mb-2">
                          {item.caption}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {item.tags?.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-white/20 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "cta_banner":
        return (
          <section
            key={section.id}
            className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-4xl font-bold mb-4">
                {section.props.headline}
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                {section.props.subtext}
              </p>
              {section.props.cta && (
                <a
                  href={section.props.cta.href}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-block"
                >
                  {section.props.cta.label}
                </a>
              )}
            </div>
          </section>
        );

      case "contact_block":
        return (
          <section key={section.id} className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                  <p className="text-gray-600">{section.props.address}</p>
                </div>
                <div>
                  <Phone className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                  <p className="text-gray-600">{section.props.phone}</p>
                </div>
                <div>
                  <Mail className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                  <p className="text-gray-600">{section.props.email}</p>
                </div>
              </div>
            </div>
          </section>
        );

      case "rich_text":
        return (
          <section key={section.id} className="py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: section.props.content }}
              />
            </div>
          </section>
        );

      case "faq_accordion":
        return (
          <section key={section.id} className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.props.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.question}
                      </h3>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return (
          <div
            key={section.id}
            className="p-8 bg-gray-100 border border-gray-300 rounded-lg"
          >
            <p className="text-gray-600">
              Section type "{section.type}" not implemented in preview
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {page.sections.filter((s) => s.visible).map(renderSection)}
    </div>
  );
}
