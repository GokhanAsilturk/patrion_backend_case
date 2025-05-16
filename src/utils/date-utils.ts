/**
 * Tarih formatı yardımcı fonksiyonları
 */

/**
 * GG/AA/YYYY formatındaki bir tarihi Date nesnesine dönüştürür
 * @param dateString GG/AA/YYYY formatında tarih dizgisi (örn: 16/05/2025)
 * @returns Date nesnesi veya geçersiz tarih ise null
 */
export const parseLocalDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // GG/AA/YYYY formatını kontrol etmek için regex
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateString.match(regex);
  
  if (!match) return null;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JavaScript'te aylar 0'dan başlar
  const year = parseInt(match[3], 10);
  
  // Geçerli bir tarih mi kontrol et
  const date = new Date(year, month, day);
  
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null; // Geçersiz tarih
  }
  
  return date;
};

/**
 * Date nesnesini GG/AA/YYYY formatına dönüştürür
 * @param date Date nesnesi
 * @returns GG/AA/YYYY formatında tarih dizgisi
 */
export const formatLocalDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // JavaScript'te aylar 0'dan başlar
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param startDate Başlangıç tarihi
 * @param endDate Bitiş tarihi
 * @returns Gün farkı
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // saat*dakika*saniye*milisaniye
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.round(diffTime / oneDay);
}; 