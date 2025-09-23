import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

type DRENode = {
  id: number
  name: string
  description: string | null
  parent_id: number | null
  type: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  total: number
  children: DRENode[]
}

type DREPayload = {
  success: boolean
  dre: Record<string, DRENode>
  summary: Record<string, number>
}

const MOCK_DRE: DREPayload = {
    success: true,
    summary: {
        "receita_bruta": 2975000,
        "deducoes": -330000,
        "receita_liquida": 2645000,
        "cmv_csv": -1400000,
        "lucro_bruto": 1245000,
        "despesas_operacionais": -784500,
        "lucro_operacional": 460500,
        "outras_receitas_despesas": 17000,
        "lucro_liquido": 477500,
        "margem_bruta": 47.1,
        "margem_operacional": 17.4,
        "margem_liquida": 18.1
    },
    dre: {
        "0": {
            "id": 1,
            "name": "Receita Bruta",
            "description": null,
            "parent_id": null,
            "type": 1,
            "created_at": "2025-09-10T20:07:51.000000Z",
            "updated_at": "2025-09-10T20:07:51.000000Z",
            "deleted_at": null,
            "total": 0,
            "children": [
                {
                    "id": 2,
                    "name": "Receita de Vendas",
                    "description": null,
                    "parent_id": 1,
                    "type": 1,
                    "created_at": "2025-09-10T20:07:51.000000Z",
                    "updated_at": "2025-09-10T20:07:51.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": [
                        {
                            "id": 24,
                            "name": "Receitas Diversas 2",
                            "description": "Teste de post para criar",
                            "parent_id": 2,
                            "type": 1,
                            "created_at": "2025-09-11T16:58:30.000000Z",
                            "updated_at": "2025-09-11T16:58:30.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        }
                    ]
                },
                {
                    "id": 3,
                    "name": "Deduções da Receita Bruta",
                    "description": null,
                    "parent_id": 1,
                    "type": 1,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": [
                        {
                            "id": 4,
                            "name": "Impostos sobre Vendas",
                            "description": null,
                            "parent_id": 3,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        },
                        {
                            "id": 5,
                            "name": "Devoluções de Vendas",
                            "description": null,
                            "parent_id": 3,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        }
                    ]
                },
                {
                    "id": 23,
                    "name": "Teste",
                    "description": "Teste de post para criar",
                    "parent_id": 1,
                    "type": 1,
                    "created_at": "2025-09-10T21:01:53.000000Z",
                    "updated_at": "2025-09-10T21:01:53.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": [
                        {
                            "id": 25,
                            "name": "Receitas Dispersas",
                            "description": "Teste de post para criar",
                            "parent_id": 23,
                            "type": 1,
                            "created_at": "2025-09-11T17:01:36.000000Z",
                            "updated_at": "2025-09-11T17:01:36.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        }
                    ]
                }
            ]
        },
        "3": {
            "id": 20,
            "name": "Outras Receitas e Despesas",
            "description": null,
            "parent_id": null,
            "type": 1,
            "created_at": "2025-09-10T20:07:52.000000Z",
            "updated_at": "2025-09-10T20:07:52.000000Z",
            "deleted_at": null,
            "total": 0,
            "children": [
                {
                    "id": 21,
                    "name": "Receitas Não Operacionais",
                    "description": null,
                    "parent_id": 20,
                    "type": 1,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": []
                },
                {
                    "id": 22,
                    "name": "Despesas Não Operacionais",
                    "description": null,
                    "parent_id": 20,
                    "type": 2,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": []
                }
            ]
        },
        "1": {
            "id": 6,
            "name": "Custos da Mercadoria/Serviço Vendido (CMV/CSV)",
            "description": null,
            "parent_id": null,
            "type": 2,
            "created_at": "2025-09-10T20:07:52.000000Z",
            "updated_at": "2025-09-10T20:07:52.000000Z",
            "deleted_at": null,
            "total": -355987.02,
            "children": [
                {
                    "id": 7,
                    "name": "Compras de Mercadorias",
                    "description": null,
                    "parent_id": 6,
                    "type": null,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": []
                },
                {
                    "id": 8,
                    "name": "Custos de Produção",
                    "description": null,
                    "parent_id": 6,
                    "type": 2,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": []
                }
            ]
        },
        "2": {
            "id": 9,
            "name": "Despesas Operacionais",
            "description": null,
            "parent_id": null,
            "type": 2,
            "created_at": "2025-09-10T20:07:52.000000Z",
            "updated_at": "2025-09-10T20:07:52.000000Z",
            "deleted_at": null,
            "total": 0,
            "children": [
                {
                    "id": 10,
                    "name": "Despesas com Vendas",
                    "description": null,
                    "parent_id": 9,
                    "type": 2,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": [
                        {
                            "id": 11,
                            "name": "Comissões",
                            "description": null,
                            "parent_id": 10,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        },
                        {
                            "id": 12,
                            "name": "Propaganda e Publicidade",
                            "description": null,
                            "parent_id": 10,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        }
                    ]
                },
                {
                    "id": 13,
                    "name": "Despesas Administrativas",
                    "description": null,
                    "parent_id": 9,
                    "type": 2,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": [
                        {
                            "id": 14,
                            "name": "Salários e Encargos Sociais",
                            "description": null,
                            "parent_id": 13,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        },
                        {
                            "id": 15,
                            "name": "Aluguel",
                            "description": null,
                            "parent_id": 13,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        },
                        {
                            "id": 16,
                            "name": "Energia Elétrica",
                            "description": null,
                            "parent_id": 13,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        }
                    ]
                },
                {
                    "id": 17,
                    "name": "Despesas Financeiras",
                    "description": null,
                    "parent_id": 9,
                    "type": 2,
                    "created_at": "2025-09-10T20:07:52.000000Z",
                    "updated_at": "2025-09-10T20:07:52.000000Z",
                    "deleted_at": null,
                    "total": 0,
                    "children": [
                        {
                            "id": 18,
                            "name": "Juros Passivos",
                            "description": null,
                            "parent_id": 17,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        },
                        {
                            "id": 19,
                            "name": "Variações Monetárias Passivas",
                            "description": null,
                            "parent_id": 17,
                            "type": null,
                            "created_at": "2025-09-10T20:07:52.000000Z",
                            "updated_at": "2025-09-10T20:07:52.000000Z",
                            "deleted_at": null,
                            "total": 0,
                            "children": []
                        }
                    ]
                }
            ]
        }
    }
}

const formatCurrencyBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const isPercentageKey = (key: string) => key.startsWith('margem_')

const formatPercentagePT = (value: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value) + '%'

const formatSummaryValue = (key: string, value: number) =>
  isPercentageKey(key) ? formatPercentagePT(value) : formatCurrencyBRL(value)

const getValueClass = (key: string, value: number) => {
  if (isPercentageKey(key)) {
    if (value < 0) return 'text-red-600'
    if (value > 0) return 'text-emerald-700'
    return 'text-muted-foreground'
  }
  if (value < 0) return 'text-red-600'
  if (value > 0) return 'text-emerald-700'
  return 'text-muted-foreground'
}

const formatKeyLabel = (key: string) => {
    const labels: Record<string, string> = {
      receita_bruta: 'Receita Bruta',
      deducoes: '(-) Deduções',
      receita_liquida: 'Receita Líquida',
      cmv_csv: '(-) CMV/CSV',
      lucro_bruto: 'Lucro Bruto',
      despesas_operacionais: '(-) Despesas Operacionais',
      lucro_operacional: 'Lucro Operacional',
      outras_receitas_despesas: 'Outras Receitas e Despesas',
      lucro_liquido: 'Lucro Líquido do Exercício',
      margem_bruta: 'Margem Bruta',
      margem_operacional: 'Margem Operacional',
      margem_liquida: 'Margem Líquida'
    }
    return labels[key] || key
  }

export function TreeRow({ node, level = 0 }: { node: DRENode, level?: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const paddingLeft = 12 + level * 16
  const isExpense = node.type === 2
  const isEntry = node.type === 1
  const valueClass = isExpense
    ? 'text-red-600'
    : node.total < 0
      ? 'text-red-600'
      : node.total > 0
        ? 'text-emerald-700'
        : 'text-green-600'       

  return (
    <div>
      <div className="flex items-center justify-between py-2 hover:bg-accent rounded-md" style={{ paddingLeft }}>
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(!open)}>
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <span className="inline-block w-6" />
          )}
          <span className={`text-sm font-medium ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
            {isExpense ? '(-) ' : '(+) '}{node.name}
          </span>
        </div>
        <div className={`text-sm font-semibold tabular-nums ${valueClass}`}>{formatCurrencyBRL(node.total)}</div>
      </div>
      {hasChildren && open && (
        <div className="border-l border-border ml-6">
          {node.children.map(child => (
            <TreeRow key={child.id} node={child} level={level + 1} />)
          )}
        </div>
      )}
    </div>
  )
}

export function DRE() {
  const data = useMemo(() => Object.values(MOCK_DRE.dre), [])
  const summary = useMemo(() => MOCK_DRE.summary, [])

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DRE Gerencial</h1>
          <p className="text-muted-foreground">Visualização hierárquica das contas e totais</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="divide-y divide-border">
            {data.map(root => (
              <div key={root.id} className="py-2">
                <TreeRow node={root} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(
              [
                'receita_bruta',
                'deducoes',
                'receita_liquida',
                'cmv_csv',
                'lucro_bruto',
                'despesas_operacionais',
                'lucro_operacional',
                'outras_receitas_despesas',
                'lucro_liquido',
                'margem_bruta',
                'margem_operacional',
                'margem_liquida'
              ] as Array<keyof typeof summary>
            ).filter((k) => k in summary).map((key) => {
              const value = summary[key] as number
              return (
                <div key={key} className="rounded-md border border-border p-4 bg-card">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {formatKeyLabel(key)}
                  </div>
                  <div className={`text-xl font-semibold tabular-nums ${getValueClass(key, value)}`}>
                    {formatSummaryValue(key, value)}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default DRE;
