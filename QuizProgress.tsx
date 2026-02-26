interface Props {
  current: number;
  total: number;
}

const QuizProgress = ({ current, total }: Props) => {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>{current} of {total} answered</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;
