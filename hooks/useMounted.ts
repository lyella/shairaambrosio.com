import { useSyncExternalStore } from "react";

// Read-only UI state that is only true after hydration.
//
// Six components each ran `const [mounted, setMounted] = useState(false);
// useEffect(() => setMounted(true), [])`, which costs an extra render pass per
// consumer and is flagged by react-hooks/set-state-in-effect. This reads the same
// fact during render instead: false on the server and during hydration, true after.
//
// Usage:  const mounted = useMounted();
//         return <>{mounted && <HeavyClientOnlyThing />}</>;
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const useMounted = () => useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
