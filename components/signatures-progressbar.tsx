interface SignaturesProgressbarProps {
  currentIndex: number;
  total: number;
  signedCount: number;
}

export default function SignaturesProgressbar({
  currentIndex,
  total,
  signedCount,
}: SignaturesProgressbarProps) {
  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <div>
      <div aria-hidden="true" className="mt-2">
        <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
          />
        </div>
        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
          <span>Teilnehmer {currentIndex + 1} von {total}</span>
          <span>{signedCount} von {total} unterschrieben</span>
        </div>
      </div>
    </div>
  );
}