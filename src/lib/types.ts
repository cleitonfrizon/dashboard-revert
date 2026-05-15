export type SourceStatus = 'ok' | 'stale' | 'error';
export type CplStatus = 'good' | 'warning' | 'bad';
export type SaturationRecommendation = 'ok' | 'monitor' | 'trocar';

export interface CacheMeta {
  generated_at: string;
  next_refresh_at: string;
  period: {
    start: string;
    end: string;
    label: string;
  };
  sources_status: {
    meta_ads: SourceStatus;
    reonic: SourceStatus;
    google_ads?: SourceStatus | 'not_configured';
    last_meta_fetch: string;
    last_reonic_fetch: string;
    last_google_fetch?: string;
  };
}

export interface HeroBlock {
  spend_today: number;
  spend_today_delta_pct: number;
  cpl_today: number;
  cpl_7d_avg: number;
  cpl_status: CplStatus;
  leads_today: number;
  leads_yesterday: number;
  avg_response_time_today_sec: number;
  cac?: number;
  roas?: number;
  vendas_count?: number;
  vendas_revenue?: number;
  ticket_medio_realizado?: number;
}

export interface PipelineBlock {
  open_count: number;
  open_revenue: number;
  win_rate: number;
  avg_cycle_days: number;
  forecast_count: number;
  forecast_revenue: number;
  won_count: number;
  lost_count: number;
}

export interface LossReasonItem {
  reason: string;
  count: number;
  pct: number;
  revenue_lost: number;
}

export interface LossReasonsBlock {
  items: LossReasonItem[];
  total_lost: number;
}

export interface MixSolarBlock {
  total_won_30d: number;
  solar: { count: number; total_kwp: number; total_modules: number; avg_kwp: number };
  armazenamento: { count: number };
  bomba_calor: { count: number };
  wallbox: { count: number };
}

export interface FunilBlock {
  leads: number;
  triagem: number;
  proposta: number;
  negociacao: number;
  fechado: number;
  conversion_rates: {
    lead_to_triagem: number;
    triagem_to_proposta: number;
    proposta_to_negociacao: number;
    negociacao_to_fechado: number;
  };
  benchmarks: {
    lead_to_triagem: number;
    triagem_to_proposta: number;
    proposta_to_negociacao: number;
    negociacao_to_fechado: number;
  };
}

export type AdChannel = 'meta' | 'google';

export interface CampanhaRow {
  id: string;
  name: string;
  status: string;
  channel?: AdChannel;
  impressions: number;
  ctr: number;
  conversas_meta: number;
  leads_reonic: number;
  cpl_real: number;
  mql: number;
  cac: number;
  ticket_medio_realizado: number;
  spend: number;
}

export interface VelocidadeBlock {
  distribuicao: {
    ate_1min: number;
    um_a_dez_min: number;
    dez_a_sessenta_min: number;
    uma_a_24h: number;
    mais_de_24h: number;
  };
  avg_response_today_sec: number;
  avg_response_7d_sec: number;
  avg_response_30d_sec: number;
  hall_da_vergonha: Array<{
    lead_id: string;
    nome: string;
    telefone_mascarado: string;
    origem: string;
    created_at: string;
    hours_waiting: number;
  }>;
}

export interface MixProdutoRow {
  produto: string;
  leads: number;
  propostas: number;
  fechamentos: number;
  ticket_medio: number;
  tempo_medio_funil_dias: number;
  por_canal: {
    meta_ads: number;
    google_ads: number;
    offline: number;
  };
}

export interface SaturacaoRow {
  ad_id: string;
  ad_name: string;
  campaign_name: string;
  frequency: number;
  ctr_7d: number;
  ctr_trend_pct: number;
  cpl_7d: number;
  cpl_trend_pct: number;
  spend_total: number;
  recommendation: SaturationRecommendation;
}

export interface GoogleAdsCampaignRow {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cost_per_conversion: number;
  leads_reonic: number;
  cpl_real: number;
}

export interface GoogleAdsBlock {
  customer_id: string;
  campanhas: GoogleAdsCampaignRow[];
  totals: {
    spend_7d: number;
    spend_30d: number;
    conversions_7d: number;
    conversions_30d: number;
  };
}

export interface SparklinePoint {
  day: string;
  spend: number;
  leads: number;
  cpl: number;
}

export interface PeriodSlice {
  hero: HeroBlock;
  funil: FunilBlock;
  campanhas: CampanhaRow[];
  velocidade: VelocidadeBlock;
  period_label: string;
  spend_total?: number;
  sparkline_7d?: SparklinePoint[];
  pipeline?: PipelineBlock;
  loss_reasons?: LossReasonsBlock;
}

export interface DashboardCache {
  meta: CacheMeta;
  hero: HeroBlock;
  funil: FunilBlock;
  campanhas: CampanhaRow[];
  velocidade: VelocidadeBlock;
  mix_produto: MixProdutoRow[] | null;
  mix_solar?: MixSolarBlock;
  saturacao: SaturacaoRow[];
  google_ads?: GoogleAdsBlock | null;
  by_period?: Record<PeriodPreset, PeriodSlice>;
}

export interface DashboardResponse {
  ok: boolean;
  data?: DashboardCache;
  cached_at?: string;
  error?: string;
  retry_after_sec?: number;
}

export type PeriodPreset = 'hoje' | '7d' | '30d' | 'mes_atual';
