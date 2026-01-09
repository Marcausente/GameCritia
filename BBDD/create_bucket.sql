-- Manually insert the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do update set public = true;

-- Verify creation
select id, name, public from storage.buckets where id = 'review-images';
