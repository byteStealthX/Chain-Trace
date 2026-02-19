import { supabase } from '../lib/supabase';

export async function uploadCsvToStorage(file: File) {
    const timestamp = Date.now();
    // Use a simpler path for now, maybe just "raw/{filename}"
    const filePath = `raw/${timestamp}_${file.name}`;

    const { data, error } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, file);

    if (error) {
        console.error('Storage upload error:', error);
        // Don't throw, just return null so we don't break the whole flow if storage fails
        return null;
    }

    return data;
}
