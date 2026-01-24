import { useState } from 'react';
import { getSkillWeight, type SkillCategory } from '../../shared/constants/skillCategories';

interface SkillsListProps {
  skills: string[];
  type: 'matched' | 'missing';
  grouped?: boolean; // Toggle for categorized view
}

const CATEGORY_CONFIG: Record<SkillCategory, { label: string; emoji: string }> = {
  technical: { label: 'Technical Skills', emoji: '💻' },
  tools: { label: 'Tools & Platforms', emoji: '🔧' },
  soft: { label: 'Soft Skills', emoji: '🤝' },
};

export default function SkillsList({ skills, type, grouped = true }: SkillsListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<SkillCategory>>(new Set());

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const { category } = getSkillWeight(skill);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, string[]>);

  const toggleCategory = (category: SkillCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // If not grouped, render as simple list (original behavior)
  if (!grouped || Object.keys(groupedSkills).length === 1) {
    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`skill-tag ${
              type === 'matched' ? 'skill-tag-matched' : 'skill-tag-missing'
            }`}
          >
            {type === 'matched' ? '✓' : '✗'} {skill}
          </span>
        ))}
      </div>
    );
  }

  // Render grouped by category
  const categories: SkillCategory[] = ['technical', 'tools', 'soft'];

  return (
    <div className="space-y-3">
      {categories.map(category => {
        const categorySkills = groupedSkills[category];
        if (!categorySkills || categorySkills.length === 0) return null;

        const isCollapsed = collapsedCategories.has(category);
        const config = CATEGORY_CONFIG[category];

        return (
          <div key={category} className="skill-category">
            <button
              onClick={() => toggleCategory(category)}
              className="skill-category-header w-full flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <span>{config.emoji}</span>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {config.label}
                </span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {categorySkills.length}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {isCollapsed ? '▶' : '▼'}
              </span>
            </button>

            {!isCollapsed && (
              <div className="flex flex-wrap gap-2 pl-6">
                {categorySkills.map((skill, index) => (
                  <span
                    key={index}
                    className={`skill-tag ${
                      type === 'matched' ? 'skill-tag-matched' : 'skill-tag-missing'
                    }`}
                  >
                    {type === 'matched' ? '✓' : '✗'} {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
