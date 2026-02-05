#!/bin/bash
git add -A
git commit -m "${1:-Update}"
git push origin main
