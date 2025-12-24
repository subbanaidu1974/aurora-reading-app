export interface Category {
  id: string;
  name: string;
  color: string; // background color (soft, dyslexia-friendly)
  icon: string;  // Material icon name
  subtopics?: string[]; // optional list of subtopics / subcategories
}
export interface Category {
  id: string;
  name: string;
  color: string; // hex or css color
}
