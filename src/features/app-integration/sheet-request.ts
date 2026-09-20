/** One active sheet owns its promise; late completions cannot resolve a later request. */
export function createSheetRequest<Input, Result>(cancelled: (input: Input) => Result) {
  let sequence = 0;
  let snapshot: { id: number; input: Input } | null = null;
  let resolve: ((result: Result) => void) | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(listener => listener());
  const finish = (id: number, result: Result) => {
    if (snapshot?.id !== id) return;
    const done = resolve;
    snapshot = null; resolve = undefined;
    emit(); done?.(result);
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    open(input: Input): Promise<Result> {
      if (snapshot) return Promise.resolve(cancelled(input));
      return new Promise<Result>(done => {
        resolve = done; snapshot = { id: ++sequence, input }; emit();
      });
    },
    finish,
    cancel() { if (snapshot) finish(snapshot.id, cancelled(snapshot.input)); },
  };
}
