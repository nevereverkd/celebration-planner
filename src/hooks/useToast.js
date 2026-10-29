/**
 * useToast.js
 * Custom hook for toast notifications.
 */

import { useCallback } from 'react'
import { useApp, ActionTypes } from '../context/AppContext'

export function useToast() {
  const { dispatch } = useApp()

  const toast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    dispatch({ type: ActionTypes.ADD_TOAST, payload: { id, message, toastType: type } })
    setTimeout(() => {
      dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id })
    }, 4000)
  }, [dispatch])

  return { toast }
}

