CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  place_name TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_forum_comments_post_id ON public.forum_comments(post_id);

GRANT SELECT, INSERT, UPDATE ON public.forum_posts TO anon, authenticated;
GRANT ALL ON public.forum_posts TO service_role;
GRANT SELECT, INSERT ON public.forum_comments TO anon, authenticated;
GRANT ALL ON public.forum_comments TO service_role;

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_posts_public_read" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "forum_posts_public_insert" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "forum_posts_public_like" ON public.forum_posts FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "forum_comments_public_read" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "forum_comments_public_insert" ON public.forum_comments FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;