#!/bin/bash

if [[ "$MODE" == "Sauce" ]]; then
  # Before running the sauce build, we have to manually build our distribution files
  # We don't want to have `build` as dependency of the karma-sauce task.
  gulp build
  gulp karma-sauce
else
  gulp karma --reporters='dots'
fi