import { useRef, useEffect } from 'react';
/**
 * @param effect
 * @param dependencies
 *
 */
export default function useNoInitialEffect(effect, dependencies) {
    //Preserving the true by default as initial render cycle
    const initialRender = useRef(true);
    useEffect(() => {
        let effectReturns = () => { };
        // Updating the ref to false on the first render, causing
        // subsequent render to execute the effect
        if (initialRender.current) {
            initialRender.current = false;
        }
        else {
            effectReturns = effect();
        }
        // Preserving and allowing the Destructor returned by the effect
        // to execute on component unmount and perform cleanup if
        // required.
        if (effectReturns && typeof effectReturns === 'function') {
            return effectReturns;
        }
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
}