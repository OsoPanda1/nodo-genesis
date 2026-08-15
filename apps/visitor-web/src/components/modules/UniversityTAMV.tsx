/**
 * Universidad TAMV - Centro de Aprendizaje
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Clock,
  Star,
  Play,
  Lock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  modules: number;
  enrolled: number;
  rating: number;
  price: number;
  thumbnail: string;
  progress?: number;
  completed?: boolean;
}

const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Introducción a TAMV Online",
    description:
      "Aprende los fundamentos del ecosistema TAMV y cómo aprovechar todas sus funcionalidades.",
    instructor: "Isabella AI",
    category: "Fundamentos",
    difficulty: "beginner",
    duration: 4,
    modules: 8,
    enrolled: 15420,
    rating: 4.9,
    price: 0,
    thumbnail: "/placeholder.svg",
    progress: 75,
  },
  {
    id: "2",
    title: "Creación de DreamSpaces",
    description: "Domina el arte de crear espacios inmersivos 3D para tus seguidores.",
    instructor: "Anubis Academy",
    category: "Creación",
    difficulty: "intermediate",
    duration: 12,
    modules: 15,
    enrolled: 8730,
    rating: 4.8,
    price: 150,
    thumbnail: "/placeholder.svg",
    progress: 30,
  },
  {
    id: "3",
    title: "Monetización para Creadores",
    description: "Estrategias avanzadas para generar ingresos con tu contenido en TAMV.",
    instructor: "Banco TAMV",
    category: "Economía",
    difficulty: "advanced",
    duration: 8,
    modules: 10,
    enrolled: 5200,
    rating: 4.7,
    price: 200,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "4",
    title: "Seguridad y Triple Federado",
    description: "Entiende cómo funciona el sistema de seguridad del metaverso.",
    instructor: "Anubis Sentinel",
    category: "Seguridad",
    difficulty: "intermediate",
    duration: 6,
    modules: 12,
    enrolled: 3400,
    rating: 4.9,
    price: 100,
    thumbnail: "/placeholder.svg",
  },
];

const CATEGORIES = ["Todos", "Fundamentos", "Creación", "Economía", "Seguridad", "IA", "XR"];

const UniversityTAMV = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [activeTab, setActiveTab] = useState("explore");

  const filteredCourses =
    selectedCategory === "Todos"
      ? MOCK_COURSES
      : MOCK_COURSES.filter((c) => c.category === selectedCategory);

  const myCourses = MOCK_COURSES.filter((c) => c.progress !== undefined);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Universidad TAMV</h1>
            <p className="text-muted-foreground">
              Centro de aprendizaje del ecosistema · Triple Federado
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: BookOpen, label: "Cursos disponibles", value: "150+" },
            { icon: Users, label: "Estudiantes activos", value: "45K+" },
            { icon: Award, label: "Certificaciones", value: "25" },
            { icon: TrendingUp, label: "Tasa de completado", value: "87%" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className="w-8 h-8 text-primary/70" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="explore">Explorar</TabsTrigger>
          <TabsTrigger value="my-courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="certificates">Certificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Grid de cursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-primary/30" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Ver curso
                      </Button>
                    </div>
                    {course.price === 0 && (
                      <Badge className="absolute top-2 left-2 bg-green-500">GRATIS</Badge>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}h
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.modules} módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {course.rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {course.enrolled.toLocaleString()} estudiantes
                      </span>
                      <span className="font-bold text-lg">
                        {course.price === 0 ? "Gratis" : `${course.price} TAU`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-courses" className="space-y-6">
          {myCourses.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">Aún no tienes cursos</h3>
              <p className="text-muted-foreground mb-4">
                Explora nuestro catálogo y comienza tu aprendizaje
              </p>
              <Button onClick={() => setActiveTab("explore")}>Explorar cursos</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {myCourses.map((course) => (
                <Card key={course.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{course.progress}% completado</span>
                          {course.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                    <Button>Continuar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">Tus certificaciones</h3>
            <p className="text-muted-foreground mb-4">
              Completa cursos para obtener certificaciones verificadas con Triple Federado
            </p>
            <Button onClick={() => setActiveTab("explore")}>Ver cursos con certificación</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UniversityTAMV;
