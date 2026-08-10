# Ticket Scanning at Venue Entry

**Priority:** High
**Team:** Platform

## Background

We're a theater ticketing company. Customers buy tickets to performances online. There's no way for venue staff to verify a ticket at the door — they've been checking names against a printed list, which doesn't scale.

## What we need

Add support for **identifying and scanning tickets at entry**. A staff member at the venue door should be able to scan a customer's ticket and immediately know whether to let them in.

## Who consumes this

Two teams will use what you build:

1. **Consumer app team** — needs to display something scannable to the customer on their phone
2. **Venue scanning app team** — building a separate app that staff use at the door to scan and validate tickets

## Identity

Authentication is stubbed, not implemented — wiring real sessions or tokens is out of scope. Each client asserts who it is with a header, and the service takes it at face value:

| Caller | Header | Example |
|---|---|---|
| Consumer app (a customer) | `X-Customer-Email` | `john.smith@email.com` |
| Venue scanning app (venue staff) | `X-Staff-Id` | `staff-1` |

Treat the header as already verified — assume something upstream authenticated the caller. The stub attaches the claimed identity and nothing else; it doesn't reject anonymous requests. See the `com.ttg.orderservice.identity` package.

The existing order and performance endpoints are unauthenticated. Leave them that way — retrofitting them isn't part of this ticket.

## Scope

Build **two endpoints** in this service:

1. **An endpoint the consumer app calls** to get whatever the customer needs to show at the door for a ticket they own.
2. **An endpoint the venue scanning app calls** when staff scan that ticket, returning a clear answer about whether the person gets in.

Everything else is your call: what the scannable thing actually is, what the request and response shapes look like, how the two endpoints relate, what happens on a repeat scan, what you store, and how much you validate. Be ready to explain why.

## Scan history

Venue operations needs to see every time a ticket was presented at a door — **including the presentations that were turned away** — so they can settle disputes after the event.

## Deliverable

Working code in this repo — no PR needed. Leave it on a branch or in your working tree, whatever's easiest.

We care much more about the conversation than the diff. Afterwards we'll walk through what you built and talk about:

- how you framed the problem for your AI tools and how you steered them
- the proposals they gave you, which you took, which you rejected, and why
- the trade-offs in what you shipped, and what you'd do differently with more time

Be prepared to explain any line of it as your own.

## Working with AI

You're encouraged to use AI as much as you want — for exploring the problem, planning your approach, writing code, whatever helps. Bring whatever tools you normally work with.
