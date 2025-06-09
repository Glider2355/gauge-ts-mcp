import { basicWebTemplate } from "./basic-web.js";
import { webEcommerceTemplate } from "./web-ecommerce.js";
import { apiTestingTemplate } from "./api-testing.js";

export type TemplateType = {
  specContent: (projectName: string) => string;
  stepsContent: (projectName: string) => string;
  setupContent: () => string;
};

export const TEMPLATES: Record<string, TemplateType> = {
  "basic-web": basicWebTemplate,
  "web-ecommerce": webEcommerceTemplate,
  "api-testing": apiTestingTemplate,
};

export const getTemplate = (templateName: string): TemplateType | null => {
  return TEMPLATES[templateName] || null;
};

export const getAvailableTemplates = (): string[] => {
  return Object.keys(TEMPLATES);
};
