import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Twitter, Facebook, Instagram } from 'lucide-react';

const socialNetworks = ['Twitter', 'Facebook', 'Instagram'] as const;
type SocialNetwork = typeof socialNetworks[number];

const socialIcons: Record<SocialNetwork, JSX.Element> = {
  Facebook: <Facebook className="w-4 h-4" />,
  Instagram: <Instagram className="w-4 h-4" />,
  Twitter: <Twitter className="w-4 h-4" />,
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md min-h-[112px] ${
        isScrolled ? 'bg-white/90 shadow-md' : 'bg-white/30'
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 h-28">
        {/* LOGO DESTACADA */}
        <a href="/" className="flex items-center space-x-2">
          <img
            src="/images/fusionup.png"
            alt="Logo da FusionUp"
            className="h-20 md:h-28 w-auto transition-all duration-300"
          />
        </a>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-gray-800 hover:text-[#0066B3] transition-colors">Home</a>

          <div className="relative group">
            <button className="flex items-center text-gray-800 hover:text-[#0066B3] transition-colors">
              Sobre Nós <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <a href="/sobre" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E6F0F7] hover:text-[#0066B3]">Nossa História</a>
              <a href="/equipe" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E6F0F7] hover:text-[#0066B3]">Nossa Equipe</a>
            </div>
          </div>

          <a href="/servicos" className="text-gray-800 hover:text-[#0066B3] transition-colors">Nossos Serviços</a>
          <a href="/blog" className="text-gray-800 hover:text-[#0066B3] transition-colors">Blog</a>
          <a href="/contato" className="bg-[#0066B3] text-white px-6 py-2 rounded-md hover:bg-[#004D86] transition-colors">Fale Conosco</a>
        </nav>

        {/* Ícones sociais desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {socialNetworks.map((network) => (
            <a key={network} href="#" className="text-[#0066B3] hover:text-[#004D86] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#E6F0F7] flex items-center justify-center">
                <span className="sr-only">{network}</span>
                {socialIcons[network]}
              </div>
            </a>
          ))}
        </div>

        {/* Botão de menu mobile */}
        <button
          className="md:hidden text-gray-800 hover:text-[#0066B3] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <a href="/" className="block text-gray-800 hover:text-[#0066B3] transition-colors">Home</a>
            <div>
              <button className="flex items-center w-full text-left text-gray-800 hover:text-[#0066B3] transition-colors">
                Sobre Nós <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="pl-4 mt-2 space-y-2">
                <a href="/sobre" className="block text-gray-700 hover:text-[#0066B3] transition-colors">Nossa História</a>
                <a href="/equipe" className="block text-gray-700 hover:text-[#0066B3] transition-colors">Nossa Equipe</a>
              </div>
            </div>
            <a href="/servicos" className="block text-gray-800 hover:text-[#0066B3] transition-colors">Nossos Serviços</a>
            <a href="/blog" className="block text-gray-800 hover:text-[#0066B3] transition-colors">Blog</a>
            <a href="/contato" className="block bg-[#0066B3] text-white px-4 py-2 rounded-md hover:bg-[#004D86] transition-colors text-center">Fale Conosco</a>

            {/* Ícones sociais mobile */}
            <div className="flex items-center space-x-4 pt-2">
              {socialNetworks.map((network) => (
                <a key={network} href="#" className="text-[#0066B3] hover:text-[#004D86] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#E6F0F7] flex items-center justify-center">
                    <span className="sr-only">{network}</span>
                    {socialIcons[network]}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
