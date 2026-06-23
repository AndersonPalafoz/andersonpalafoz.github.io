import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DATABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[Database] Supabase URL or Key not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (recommended)');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

export async function upsertUser(user: any) {
  if (!user?.openId) throw new Error('User openId is required for upsert');
  const values: any = {
    openId: user.openId,
    lastSignedIn: user.lastSignedIn ? new Date(user.lastSignedIn).toISOString() : new Date().toISOString()
  };
  const textFields = ['name', 'email', 'loginMethod', 'role'];
  for (const f of textFields) {
    if (Object.prototype.hasOwnProperty.call(user, f)) {
      values[f] = user[f] ?? null;
    }
  }
  try {
    const { data, error } = await supabase.from('users').upsert(values, { onConflict: 'openId' }).select();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Database] Failed to upsert user:', err);
    throw err;
  }
}

export async function getUserByOpenId(openId: string) {
  if (!openId) return undefined;
  try {
    const { data, error } = await supabase.from('users').select('*').eq('openId', openId).limit(1).maybeSingle();
    if (error) {
      console.warn('[Database] getUserByOpenId error:', error);
      return undefined;
    }
    return data || undefined;
  } catch (err) {
    console.warn('[Database] Cannot get user:', err);
    return undefined;
  }
}

export async function getCourses() {
  try {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) {
      console.warn('[Database] getCourses error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Database] getCourses failed:', err);
    return [];
  }
}

export async function getMaterials() {
  try {
    const { data, error } = await supabase.from('materials').select('*');
    if (error) {
      console.warn('[Database] getMaterials error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Database] getMaterials failed:', err);
    return [];
  }
}

export async function getArticles() {
  try {
    const { data, error } = await supabase.from('articles').select('*');
    if (error) {
      console.warn('[Database] getArticles error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Database] getArticles failed:', err);
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  if (!slug) return undefined;
  try {
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).limit(1).maybeSingle();
    if (error) {
      console.warn('[Database] getArticleBySlug error:', error);
      return undefined;
    }
    return data || undefined;
  } catch (err) {
    console.warn('[Database] getArticleBySlug failed:', err);
    return undefined;
  }
}

export async function getUserEnrollments(userId: number) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase.from('enrollments').select('*').eq('userId', userId);
    if (error) {
      console.warn('[Database] getUserEnrollments error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Database] getUserEnrollments failed:', err);
    return [];
  }
}

export async function enrollUserInCourse(userId: number, courseId: number) {
  if (!userId || !courseId) throw new Error('userId and courseId are required');
  try {
    const { data, error } = await supabase.from('enrollments').insert({ userId, courseId, status: 'active', enrolledAt: new Date().toISOString() });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Database] Failed to enroll user:', err);
    throw err;
  }
}

export async function getUserCertificates(userId: number) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase.from('certificates').select('*').eq('userId', userId);
    if (error) {
      console.warn('[Database] getUserCertificates error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Database] getUserCertificates failed:', err);
    return [];
  }
}

export async function getCourseActivities(courseId: number) {
  if (!courseId) return [];
  try {
    const { data, error } = await supabase.from('activities').select('*').eq('courseId', courseId);
    if (error) {
      console.warn('[Database] getCourseActivities error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Database] getCourseActivities failed:', err);
    return [];
  }
}
