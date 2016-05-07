VEDUTA_SRC_JS_FILES := $(shell find src -type f -name '*.js')
VEDUTA_APPS_JS_FILES := $(shell find apps/ -type f -name '*.js')
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
	@echo "- serve                   Run a development web server for running the examples"
	@echo

.PHONY: build-veduta-app
build-veduta-app: build/veduta.js

.PHONY: serve
serve: .build/node_modules.timestamp 
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
		--var 'src=apps/**/*.js' \
		--var src_set=contribs_veduta \
		--var entry_point=app_$* \
		--var generate_exports=true \
		--var source_map=build/$*.js.map $< > $@

build/%.js: .build/%.js $(VEDUTA_APPS_LIBS_JS_FILES)
	awk 'FNR==1{print ""}1' $(VEDUTA_APPS_LIBS_JS_FILES) $< > $@

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