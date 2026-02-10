import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { complexesApi } from "@/api/complexes"
import type { ComplexCreate } from "@/types/complex"

export function useComplexes(params?: {
  is_active?: boolean
  skip?: number
  limit?: number
  search?: string
  region_code?: string
}) {
  return useQuery({
    queryKey: ["complexes", params],
    queryFn: () => complexesApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useRegionCounts() {
  return useQuery({
    queryKey: ["complexes", "regionCounts"],
    queryFn: () => complexesApi.regionCounts(),
  })
}

export function useComplex(id: number) {
  return useQuery({
    queryKey: ["complexes", id],
    queryFn: () => complexesApi.get(id),
    enabled: id > 0,
  })
}

export function useCreateComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ComplexCreate) => complexesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complexes"] }),
  })
}

export function useUpdateComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ComplexCreate> }) =>
      complexesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complexes"] }),
  })
}

export function useDeleteComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => complexesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complexes"] }),
  })
}

export function useSigunguList(sidoCode: string) {
  return useQuery({
    queryKey: ["sigungu", sidoCode],
    queryFn: () => complexesApi.getSigunguList(sidoCode),
    enabled: !!sidoCode,
  })
}

export function useDiscoverRegion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (regionCode: string) => complexesApi.discoverRegion(regionCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complexes"] })
    },
  })
}

export function useCollectComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => complexesApi.collect(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs"] })
      qc.invalidateQueries({ queryKey: ["complexLastRuns"] })
    },
  })
}

export function useBatchCollectComplexes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (complexIds: number[]) => complexesApi.batchCollect(complexIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs"] })
      qc.invalidateQueries({ queryKey: ["complexLastRuns"] })
    },
  })
}

export function useRunStatus(runId: number | null) {
  return useQuery({
    queryKey: ["runStatus", runId],
    queryFn: () => complexesApi.getRunStatus(runId!),
    enabled: runId !== null && runId > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "success" || status === "failed" || status === "partial") return false
      return 2000 // 진행 중일 때 2초마다 폴링
    },
  })
}

export function useComplexLastRuns() {
  return useQuery({
    queryKey: ["complexLastRuns"],
    queryFn: () => complexesApi.getLastRuns(),
    refetchInterval: 10_000,
  })
}
