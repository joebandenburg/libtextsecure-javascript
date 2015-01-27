"use strict";

module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-test"); // For server-side testing
    grunt.loadNpmTasks("grunt-traceur");
    grunt.loadNpmTasks("grunt-pure-cjs");
    grunt.loadNpmTasks("grunt-contrib-concat");

    grunt.initConfig({
        clean: {
            all: {
                src: ["build/"]
            }
        },
        jshint: {
            all: {
                src: ["Gruntfile.js", "index.js", "src/**/*.js", "test/**/*.js"],
                options: {
                    jshintrc: true
                }
            }
        },
        jscs: {
            all: {
                src: ["index.js", "src/**/*.js", "test/**/*.js"]
            }
        },
        mochaTest: {
            unitTests: {
                src: ["test/unit/**/*.js"],
                options: {
                    require: ["mocha-traceur"]
                }
            },
            integrationTests: {
                src: ["test/integration/**/*.js"],
                options: {
                    clearRequireCache: true
                }
            }
        },
        traceur: {
            dist: {
                options: {
                    modules: "commonjs"
                },
                files: [{
                    expand: true,
                    cwd: "src/",
                    src: ["**/*.js"],
                    dest: "build/src"
                }, {
                    src: ["index.js"],
                    dest: "build/index.js"
                }]
            }
        },
        pure_cjs: {
            dist: {
                files: {
                    "build/textsecure.js": ["build/index.js"]
                },
                options: {
                    exports: "textsecure",
                    external: {
                        protobufjs: {
                            global: "dcodeIO.ProtoBuf",
                            id: "__external_1"
                        },
                        "traceur/bin/traceur-runtime": {
                            amd: "traceur-runtime",
                            global: "1",
                            id: "__external_2"
                        },
                        "axolotl": true,
                        "axolotl-crypto": {
                            global: "axolotlCrypto"
                        },
                        // Axios dependences
                        http: false,
                        https: false,
                        url: false,
                        buffer: false
                    }
                }
            }
        },
        concat: {
            dist: {
                src: ["banner.js", "build/textsecure.js"],
                dest: "dist/textsecure.js"
            }
        }
    });

    grunt.registerTask("check", ["clean", "jshint", "jscs"]);
    grunt.registerTask("test", ["check", "mochaTest:unitTests"]);
    grunt.registerTask("dist", ["test", "traceur", "pure_cjs", "concat"]);
    grunt.registerTask("integration-test", ["dist", "mochaTest:integrationTests"]);

    grunt.registerTask("default", ["test"]);
};