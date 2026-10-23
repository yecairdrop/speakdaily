import type { CONNECTORS } from '../lib/analysis/connectors'

/** Turkish meaning + when to use each B2 connector. The phrases themselves stay English. */
export const CONNECTOR_MEANINGS_TR: Record<(typeof CONNECTORS)[number], string> = {
  'to be honest': 'açıkçası — samimi bir görüş söylerken',
  'the main reason is': 'asıl sebep şu — bir nedeni öne çıkarırken',
  'what I mean is': 'demek istediğim şu — kendini netleştirirken',
  'for example': 'örneğin — fikrini somut bir örnekle desteklerken',
  'on the other hand': 'öte yandan — diğer tarafı gösterirken',
  'in my experience': 'benim tecrübeme göre — kendi yaşadığına dayanırken',
  'the thing is': 'mesele şu ki — asıl noktaya gelirken (takılınca da işe yarar)',
  'as far as I know': 'bildiğim kadarıyla — emin değilken',
  "I'd say": 'bence / diyebilirim ki — yumuşak bir fikir belirtirken',
  'in other words': 'başka bir deyişle — aynı şeyi daha basit söylerken',
  'first of all': 'her şeyden önce — cevabın ilk maddesine başlarken',
  'in the end': 'sonunda — hikâyeyi ya da sonucu bağlarken',
  "that's why": 'bu yüzden — sonuç bildirirken',
  'apart from that': 'bunun dışında — yeni bir nokta eklerken',
}
