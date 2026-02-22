'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { Crosshair, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { FuzzyAutocomplete } from '@/components/ui/FuzzyAutocomplete';
import { getCoveredIndications } from '@/lib/data/competitor-database';
import { MECHANISM_SUGGESTIONS, POPULAR_MECHANISMS } from '@/lib/data/suggestion-lists';

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompetitiveFormData>({
    resolver: zodResolver(competitiveFormSchema),
    defaultValues: {
      indication: '',
      mechanism: '',
    },
  });

  const indicationValue = watch('indication');
  const coveredIndications = useMemo(() => getCoveredIndications(), []);
  const hasCoverage = indicationValue.length > 0 && coveredIndications.has(indicationValue);

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
          <IndicationAutocomplete
            value={indicationValue}
            onChange={(val) => setValue('indication', val, { shouldValidate: true })}
            error={errors.indication?.message}
            label="Indication"
            placeholder="e.g., Non-Small Cell Lung Cancer"
          />
          {indicationValue.length > 2 && (
            hasCoverage ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle2 className="h-3 w-3 text-signal-green" />
                <span className="text-[11px] text-signal-green">Competitive data available</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertTriangle className="h-3 w-3 text-signal-amber" />
                <span className="text-[11px] text-signal-amber">Limited competitive data — white-space analysis will be generated</span>
              </div>
            )
          )}
        </div>

        {/* Mechanism of Action */}
        <FuzzyAutocomplete
          label="Mechanism of Action (Optional)"
          value={watch('mechanism') || ''}
          onChange={(v) => setValue('mechanism', v)}
          items={MECHANISM_SUGGESTIONS}
          popularItems={POPULAR_MECHANISMS}
          storageKey="terrain:recent-mechanisms"
          placeholder="e.g., PD-1 inhibitor, ADC"
        />

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
