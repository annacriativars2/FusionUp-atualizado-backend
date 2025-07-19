import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { mockServices } from './mockServices';

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  bullets: string[];
  relatedProjects: { id: number; title: string; image: string }[];
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const found = mockServices.find((s) => s.slug === slug);
    setService(found || null);
  }, [slug]);

  if (!service) {
    return <div className="p-8 text-center text-red-600">Serviço não encontrado.</div>;
  }

  return (
    <div className="pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Título e imagem */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[#0066B3] mb-4">{service.title}</h1>
          <img
            src={service.image}
            alt={service.title}
            className="mx-auto rounded-xl shadow-md max-w-3xl"
          />
        </div>

        {/* Descrição e bullets */}
        <div className="max-w-3xl mx-auto mb-12 text-gray-700">
          <p className="mb-4 text-lg">{service.description}</p>
          <ul className="list-disc pl-6">
            {service.bullets.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </div>

        {/* Carrossel de projetos relacionados */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Projetos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {service.relatedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white p-2 rounded-md shadow-md hover:shadow-lg transition overflow-hidden text-center"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-md"
                />
                <h3 className="text-lg font-semibold text-gray-800 mt-3">{project.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
