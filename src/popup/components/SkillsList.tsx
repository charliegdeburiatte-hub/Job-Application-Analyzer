interface SkillsListProps {
  skills: string[];
  type: 'matched' | 'missing';
}

export default function SkillsList({ skills, type }: SkillsListProps) {
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
