FONTAWESOME_WEBFONT = $(addprefix fonts/fontawesome-webfont., eot ttf woff woff2)

VEDUTA_SRC_JS_FILES := $(shell find src -type f -name '*.js')
VEDUTA_APPS_JS_FILES := $(shell find app/ -type f -name '*.js')
VEDUTA_APPS_LESS_FILES := $(shell find less -type f -name '*.less')
VEDUTA_APPS_LIBS_JS_FILES += \
	node_modules/angular/angular.min.js \
	node_modules/angular-gettext/dist/angular-gettext.min.js \
	node_modules/ui-bootstrap-custom/ui-bootstrap-custom-tpls-1.3.2.min.js

EXTERNS_ANGULAR = .build/externs/angular-1.5.js
EXTERNS_ANGULAR_Q = .build/externs/angular-1.5-q_templated.js
EXTERNS_ANGULAR_HTTP_PROMISE = .build/externs/angular-1.5-http-promise_templated.js
EXTERNS_JQUERY = .build/externs/jquery-1.9.js
EXTERNS_FILES = $(EXTERNS_ANGULAR) $(EXTERNS_ANGULAR_Q) $(EXTERNS_ANGULAR_HTTP_PROMISE) $(EXTERNS_JQUERY)

.PHONY: all
all: help

.PHONY: help
help:
	@echo "Usage: make <target>"
	@echo
	@echo "Main targets:"
	@echo
	@echo "- help                    Display this help message"
	@echo "- build-veduta-app        Build a compiled version of the app in one file"
	@echo "- clean                   Remove generated files"
	@echo "- cleanall                Remove all the build artefacts"
	@echo "- serve                   Run a development web server for running the examples"
	@echo

.PHONY: build-veduta-app
build-veduta-app: build/veduta.js

.PHONY: serve
serve: .build/node_modules.timestamp $(FONTAWESOME_WEBFONT)
	node buildtools/serve.js

.build/node_modules.timestamp: package.json
	npm install
	mkdir -p $(dir $@)
	touch $@

.PRECIOUS: .build/%.js
.build/%.js: .build/app-%.json \
		$(EXTERNS_FILES) \
		.build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/closure-util build $< $@
	echo '//# sourceMappingURL=$*.js.map' >> $@

.PRECIOUS: .build/app-%.json
.build/app-%.json: buildtools/mako_build.json .build/python-venv/bin/mako-render
	mkdir -p $(dir $@)
	PYTHONIOENCODING=UTF-8 .build/python-venv/bin/mako-render \
		--var 'src=app/**/*.js' \
		--var src_set=contribs_veduta \
		--var entry_point=app_$* \
		--var generate_exports=true \
		--var source_map=build/$*.js.map $< > $@

.PRECIOUS: node_modules/font-awesome/fonts/fontawesome-webfont.%
node_modules/font-awesome/fonts/fontawesome-webfont.%: .build/node_modules.timestamp
	touch -c $@

fonts/fontawesome-webfont.%: node_modules/font-awesome/fonts/fontawesome-webfont.%
	mkdir -p $(dir $@)
	cp $< $@

build/%.js: .build/%.js $(VEDUTA_APPS_LIBS_JS_FILES)
	mkdir -p $(dir $@)
	awk 'FNR==1{print ""}1' $(VEDUTA_APPS_LIBS_JS_FILES) $< > $@

.PHONY: compile-css
compile-css: build/veduta.css

build/%.css: less/veduta.less \
		$(VEDUTA_APPS_LESS_FILES) \
		.build/node_modules.timestamp \
		$(FONTAWESOME_WEBFONT)
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc --autoprefix --clean-css="--s0" $< $@

.build/python-venv:
	mkdir -p $(dir $@)
	virtualenv --no-site-packages $@

$(EXTERNS_ANGULAR):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.5.js
	touch $@

$(EXTERNS_ANGULAR_Q):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.5-q_templated.js
	touch $@

$(EXTERNS_ANGULAR_HTTP_PROMISE):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.5-http-promise_templated.js
	touch $@

$(EXTERNS_JQUERY):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/jquery-1.9.js
	touch $@

.build/python-venv/bin/mako-render: .build/python-venv
	.build/python-venv/bin/pip install "Mako==1.0.0" "htmlmin==0.1.10"
	touch $@

.PHONY: clean
clean:
	rm -f .build/*.check.timestamp
	rm -f .build/eslint.timestamp
	rm -f .build/veduta.json
	rm -f .build/app-veduta.json
	rm -f $(EXTERNS_FILES)
	rm -f fonts/FontAwesome.otf
	rm -f fonts/fontawesome-webfont.*

.PHONY: cleanall
cleanall: clean
	rm -rf .build
	rm -rf node_modules
