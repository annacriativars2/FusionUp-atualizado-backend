import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  company: string;
  text: string;
  rating: number;
  image?: string;
}

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const testimonials: Testimonial[] = [
  {
  id: 1,
    name: "Juliana Ferreira",
    company: "Studio Pixel",
    text: "A equipe da Fusion Up entendeu exatamente o que eu precisava. O resultado ficou incrível e super profissional. Recomendo de olhos fechados.",
    rating: 5
  },
  {
    id: 2,
    name: "Marcos Andrade",
    company: "NeoDigital Tech",
    text: "O atendimento é impecável e o site ficou muito acima das expectativas. Nunca foi tão fácil ter presença online!",
    rating: 4
  },
  {
    id: 3,
    name: "Camila Rocha",
    company: "Bella Moda",
    text: "Com o novo design, nosso Instagram bombou! Os materiais ficaram lindos, modernos e com a nossa cara.",
    rating: 5
  },
    
  ];

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('testimonials');
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        className={`h-5 w-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <section id="testimonials" className="py-16 bg-[#E6F0F7]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">O que Nossos Clientes Dizem</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A satisfação dos clientes é o nosso maior sucesso.
          </p>
        </div>

        <div 
          className={`max-w-4xl mx-auto transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="relative bg-white rounded-xl shadow-lg p-8 md:p-12">
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#4D9FD6] rounded-full opacity-70"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#E6F0F7] rounded-full"></div>
            
            <div className="flex flex-col items-center text-center">
              {/* Testimonial Content */}
              <div className="flex-1">
                <div className="flex mb-3">
                  {renderStars(testimonials[activeIndex].rating)}
                </div>
                <p className="text-gray-600 italic mb-6">
                  "{testimonials[activeIndex].text}"
                </p>
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{testimonials[activeIndex].name}</h4>
                  <p className="text-[#0066B3]">{testimonials[activeIndex].company}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-center mt-8 space-x-4">
              <button 
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-[#0066B3] text-[#0066B3] flex items-center justify-center hover:bg-[#0066B3] hover:text-white transition-colors duration-300"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-[#0066B3] text-[#0066B3] flex items-center justify-center hover:bg-[#0066B3] hover:text-white transition-colors duration-300"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-6 bg-[#0066B3]' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
