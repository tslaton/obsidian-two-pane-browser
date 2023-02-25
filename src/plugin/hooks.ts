// Libraries
import * as React from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
// Modules
import type { RootState, AppDispatch } from './store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Ref: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef(callback)

  // Remember the latest callback
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout
  React.useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setTimeout(tick, delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}
