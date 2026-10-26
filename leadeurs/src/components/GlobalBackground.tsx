const GlobalBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-50 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(900px circle at 12% 18%, hsl(var(--primary) / 0.16) 0%, transparent 60%)," +
          "radial-gradient(750px circle at 86% 26%, hsl(var(--accent) / 0.14) 0%, transparent 58%)," +
          "radial-gradient(1000px circle at 50% 92%, hsl(var(--primary) / 0.10) 0%, transparent 62%)," +
          "linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background)))",
      }}
    />
  );
};

export default GlobalBackground;
