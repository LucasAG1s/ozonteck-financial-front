import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password?: string;
}

interface Requirement {
  regex: RegExp;
  text: string;
}

const requirements: Requirement[] = [
  { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
  { regex: /[a-z]/, text: 'Uma letra minúscula' },
  { regex: /[A-Z]/, text: 'Uma letra maiúscula' },
  { regex: /[0-9]/, text: 'Pelo menos um número' },
];

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => {
        const isValid = req.regex.test(password);
        return (
          <div key={index} className="flex items-center text-sm">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <span className={isValid ? 'text-green-500' : 'text-muted-foreground'}>
              {req.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}