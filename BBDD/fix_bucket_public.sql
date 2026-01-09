-- Force the review-images bucket to be public
update storage.buckets
set public = true
where name = 'review-images';

-- Verify the change (optional read)
select name, public from storage.buckets where name = 'review-images';
