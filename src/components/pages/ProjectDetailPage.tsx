import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  title: string;
  image: string;
  description: string;
  category: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    title: 'Redesign de E-commerce',
    image: '/images/redesignbellamoda.png',
    description: 'Projeto completo de redesign para loja virtual, focado em UX/UI, performance e responsividade.',
    category: 'web',
  },
  {
    id: 2,
    title: 'Campanha de Mídia Social',
    image: '/project2.jpg',
    description: 'Campanha digital para aumentar o engajamento e reconhecimento da marca nas redes sociais.',
    category: 'social',
  },
  {
    id: 3,
    title: 'Identidade Visual',
    image: '/project3.jpg',
    description: 'Criação de identidade visual completa incluindo logotipo, paleta de cores e materiais gráficos.',
    category: 'design',
  }
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const found = mockProjects.find((p) => p.id === Number(id));
    setProject(found || null);
  }, [id]);

  if (!project) {
    return <div className="pt-28 text-center text-red-600">Projeto não encontrado.</div>;
  }

  return (
    <div className="pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-[#0066B3] mb-6">{project.title}</h1>
        <img 
          src={project.image} 
          alt={project.title} 
          className="rounded-xl shadow-lg mx-auto mb-8 max-h-[500px] object-contain" 
        />
        <p className="text-lg text-gray-700">{project.description}</p>
      </div>
    </div>
  );
}
