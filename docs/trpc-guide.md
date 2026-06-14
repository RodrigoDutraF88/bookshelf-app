# tRPC Guide (v.1.0.0)
 
This document explains how the API layer is structured and how to work with it, whether you're reading existing procedures or adding new ones.
 
## What is tRPC?
 
tRPC lets you write server functions (procedures) in TypeScript and call them from the client with full type safety , no REST endpoints to define, no OpenAPI schemas, no code generation. The client knows the exact input and output types of every procedure because they share the same TypeScript code.