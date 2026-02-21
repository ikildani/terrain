'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crosshair, Loader2 } from 'lucide-react';

const competitiveFormSchema = z.object({
  indication: z.string().min(1, 'Indication is required'),
  mechanism: z.string().optional(),
});

type CompetitiveFormData = z.infer<typeof competitiveFormSchema>;

interface CompetitiveFormProps {
  onSubmit: (data: { indication: string; mechanism?: string }) => void;
  isLoading: boolean;
}

export default function CompetitiveForm({ onSubmit, isLoading }: CompetitiveFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompetitiveFormData>({
    resolver: zodResolver(competitiveFormSchema),
    defaultValues: {
      indication: '',
      mechanism: '',
    },
  });

  const handleFormSubmit = (data: CompetitiveFormData) => {
    onSubmit({
      indication: data.indication,
      mechanism: data.mechanism || undefined,
    });
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Indication */}
        <div>
          <label htmlFor="indication" className="input-label">
            Indication
          </label>
          <input
            id="indication"
            type="text"
            className="input"
            placeholder="e.g., Non-Small Cell Lung Cancer"
            {...register('indication')}
          />
          {errors.indication && (
            <p className="mt-1.5 text-xs text-signal-red">{errors.indication.message}</p>
          )}
        </div>

        {/* Mechanism of Action */}
        <div>
          <label htmlFor="mechanism" className="input-label">
            Mechanism of Action (Optional)
          </label>
          <input
            id="mechanism"
            type="text"
            className="input"
            placeholder="e.g., PD-1 inhibitor, ADC"
            {...register('mechanism')}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mapping Landscape...
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4" />
              Map Landscape
            </>
          )}
        </button>
      </form>
    </div>
  );
}
