FILE=Gemfile.lock
if [ -f "$FILE" ]; then
    rm $FILE
fi
docker run --rm -v "$PWD:/srv/jekyll/" -p "8080:8080" \
                    -it amirpourmand/al-folio bundler  \
                    exec gem install jekyll; jekyll serve --watch --port=8099 --host=0.0.0.0 --trace

# bundler exec jekyll clean
