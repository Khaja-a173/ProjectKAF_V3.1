import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FileText,
  Shield,
  HelpCircle,
  Phone,
  MapPin,
  Mail,
  Clock,
  Award,
  Users,
  Heart,
  ChefHat,
} from "lucide-react";

export default function Pages() {
  const pageLinks = [
    {
      title: "About Us",
      description: "Learn about our story, mission, and culinary philosophy",
      icon: Heart,
      color: "from-pink-500 to-rose-600",
    },
    {
      title: "Our Team",
      description: "Meet our talented chefs and dedicated staff members",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Awards & Recognition",
      description: "Our achievements and industry recognition",
      icon: Award,
      color: "from-yellow-500 to-orange-600",
    },
    {
      title: "Contact Us",
      description: "Get in touch with us for reservations and inquiries",
      icon: Phone,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "FAQ",
      description: "Frequently asked questions and helpful information",
      icon: HelpCircle,
      color: "from-purple-500 to-violet-600",
    },
    {
      title: "Privacy Policy",
      description: "How we protect and handle your personal information",
      icon: Shield,
      color: "from-gray-500 to-slate-600",
    },
    {
      title: "Terms of Service",
      description: "Terms and conditions for using our services",
      icon: FileText,
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Careers",
      description: "Join our team and grow your culinary career with us",
      icon: ChefHat,
      color: "from-red-500 to-pink-600",
    },
  ];

  const aboutContent = {
    story:
      "Founded in 2010, Bella Vista has been a cornerstone of fine dining in our community. Our passion for exceptional cuisine and warm hospitality has made us a beloved destination for food enthusiasts and special occasions alike.",
    mission:
      "To create unforgettable dining experiences through innovative cuisine, exceptional service, and a warm, welcoming atmosphere that brings people together.",
    values: [
      "Quality ingredients sourced locally and sustainably",
      "Culinary innovation while respecting traditional techniques",
      "Exceptional service that exceeds expectations",
      "Creating memorable experiences for every guest",
    ],
  };

  const teamMembers = [
    {
      name: "Chef Maria Rodriguez",
      position: "Executive Chef",
      bio: "With over 15 years of culinary experience, Chef Maria brings creativity and passion to every dish.",
      image:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
      name: "James Wilson",
      position: "Sous Chef",
      bio: "James specializes in modern European cuisine and leads our kitchen team with expertise.",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
      name: "Sarah Chen",
      position: "Pastry Chef",
      bio: "Sarah creates our exquisite desserts, combining artistry with exceptional flavors.",
      image:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
  ];

  const awards = [
    {
      year: "2023",
      title: "Best Fine Dining Restaurant",
      organization: "City Culinary Awards",
    },
    {
      year: "2022",
      title: "Excellence in Service",
      organization: "Restaurant Association",
    },
    {
      year: "2021",
      title: "Chef of the Year",
      organization: "Culinary Institute",
    },
    {
      year: "2020",
      title: "Sustainable Restaurant Award",
      organization: "Green Dining Initiative",
    },
  ];

  const faqs = [
    {
      question: "Do you take reservations?",
      answer:
        "Yes, we highly recommend making reservations, especially for dinner service and weekends. You can book online or call us directly.",
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer:
        "Absolutely! We can accommodate vegetarian, vegan, gluten-free, and other dietary needs. Please inform us when making your reservation.",
    },
    {
      question: "What is your dress code?",
      answer:
        "We have a smart casual dress code. We ask that guests avoid shorts, flip-flops, and athletic wear during dinner service.",
    },
    {
      question: "Do you offer private dining?",
      answer:
        "Yes, we have private dining rooms available for special events, business meetings, and celebrations. Contact us for more details.",
    },
    {
      question: "Is parking available?",
      answer:
        "We offer complimentary valet parking for all guests during dinner service. Street parking is also available.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Information Pages</h1>
          <p className="text-xl">
            Everything you need to know about Bella Vista
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pageLinks.map((page, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${page.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <page.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {page.title}
                </h3>
                <p className="text-gray-600 text-sm">{page.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* About Us Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Heart className="w-8 h-8 text-pink-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Our Story
                </h3>
                <p className="text-gray-600 mb-6">{aboutContent.story}</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-600">{aboutContent.mission}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Our Values
                </h3>
                <ul className="space-y-3">
                  {aboutContent.values.map((value, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 font-medium mb-3">
                    {member.position}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Awards & Recognition
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {award.title}
                    </h3>
                    <p className="text-gray-600">{award.organization}</p>
                    <p className="text-sm text-orange-600 font-medium">
                      {award.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Phone className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Visit Us
                </h3>
                <p className="text-gray-600">
                  123 Gourmet Street
                  <br />
                  Culinary District, CD 12345
                </p>
              </div>

              <div className="text-center">
                <Phone className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Call Us
                </h3>
                <p className="text-gray-600">
                  +1 (555) 123-4567
                  <br />
                  Reservations & Inquiries
                </p>
              </div>

              <div className="text-center">
                <Mail className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email Us
                </h3>
                <p className="text-gray-600">
                  info@bellavista.com
                  <br />
                  events@bellavista.com
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <HelpCircle className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
