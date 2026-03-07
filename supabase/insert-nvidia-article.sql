-- =====================================================
-- INSERT ARTICLE: Why Nvidia Just Stepped Back from OpenAI and Anthropic
-- Run this in Supabase SQL Editor
-- =====================================================

INSERT INTO journal_articles (
  title, slug, subtitle, excerpt, content,
  pillar_id, author_id, content_type,
  featured_image_url, featured_image_alt,
  meta_title, meta_description, keywords,
  reading_time, word_count, status, published_at,
  agent_generated, human_edited
)
SELECT
  'Why Nvidia Just Stepped Back from OpenAI and Anthropic',
  'nvidia-steps-back-openai-anthropic',
  'And What It Signals for the Entire AI Industry',
  'Jensen Huang confirmed Nvidia is done writing massive checks to OpenAI and Anthropic. The official reason is IPOs. The real story involves neutrality, politics, circular capital flows, and the future of AI infrastructure.',
  E'Earlier this week, Jensen Huang did something that caught the entire tech world off guard. Nvidia''s CEO quietly confirmed that the company is effectively done writing massive checks to the two most prominent AI developers on the planet: OpenAI and Anthropic.

The original whisper was that Nvidia planned to invest up to $100 billion into OpenAI. That number got trimmed to a finalized $30 billion, deployed as part of OpenAI''s recent $110 billion funding round at a $730 billion pre money valuation. As for Anthropic, the $10 billion Nvidia committed will likely be the last. "Probably will be the last as well," Huang told attendees at the Morgan Stanley Technology, Media and Telecom Conference on March 4 ([Reuters](https://www.reuters.com/business/nvidia-will-not-be-able-invest-100-billion-openai-due-ipo-ceo-jensen-says-2026-03-04/)).

On the surface, the reasoning sounds simple. Both OpenAI and Anthropic are reportedly preparing to go public. OpenAI is laying the groundwork for an IPO that could value the company at up to $1 trillion. Anthropic, fresh off a $30 billion funding round at a $380 billion valuation ([NYT](https://www.nytimes.com/2026/02/12/technology/anthropic-valuation-380-billion-funding.html)), is positioning for a similar move. The window for massive private investments is closing naturally.

But if you look closer, the real story is far more interesting.

## The Neutral Arms Dealer Problem

Nvidia makes the GPUs that power virtually every major AI system in the world. OpenAI runs on Nvidia silicon. So does Anthropic. So does Google. So does Meta. So does Elon Musk''s xAI. Every single one of them writes enormous purchase orders for Nvidia hardware.

Now imagine you are Nvidia, and you own a significant stake in OpenAI. Every other customer on your list is suddenly asking the same question: whose side are you on?

The answer Nvidia needs to give is nobody''s. They want to be the company that sells shovels during the gold rush. The moment they start owning the miners, the entire dynamic shifts. Customers start looking for alternatives. Trust erodes. Contracts get questioned.

By stepping back from ownership positions in OpenAI and Anthropic, Nvidia is protecting the one thing that matters most: their position as the indispensable, neutral infrastructure provider for the entire AI economy.

## The Pentagon Situation Nobody Can Ignore

There is another layer here that is playing out in real time as this article is being written.

OpenAI and Anthropic are not just competitors. They are locked in an increasingly heated rivalry that has spilled beyond product benchmarks and into the corridors of the United States Department of Defense.

On February 28, OpenAI announced it had struck a deal with the Pentagon to supply AI to classified military networks ([The Guardian](https://www.theguardian.com/technology/2026/feb/28/openai-us-military-anthropic)). This came hours after the Trump administration ordered the government to stop using Anthropic''s services, going so far as to classify Anthropic as a "supply chain risk." The directive stated that no contractor, supplier, or partner doing business with the U.S. military may conduct any commercial activity with Anthropic ([MIT Technology Review](https://www.technologyreview.com/2026/03/02/1133850/openais-compromise-with-the-pentagon-is-what-anthropic-feared/)).

The reason? Anthropic had raised concerns about its Claude models being used for mass surveillance and fully autonomous weapons systems ([BBC](https://www.bbc.com/news/articles/c3rz1nd0egro)). The Pentagon''s response was not negotiation. It was exclusion.

As of March 5, Anthropic CEO Dario Amodei is back at the negotiating table with the Department of Defense in what reports describe as a "last ditch effort" to reach terms ([CNBC](https://www.cnbc.com/2026/03/05/anthropic-pentagon-ai-deal-department-of-defense-openai-.html)).

If you are Nvidia and you hold major financial positions in both companies, you are caught directly in the crossfire. Every contract dispute, every executive order, every political maneuver creates exposure. Pulling back from ownership eliminates that risk entirely.

Nvidia gets to stay in the business of selling the world''s best AI hardware without inheriting the political baggage of the companies building on top of it.

## The Circular Logic Problem

![Circular Capital Flow](/images/journal/circular-flow.png)

This is the part that makes financial analysts nervous.

Consider the math. Nvidia invests $30 billion into OpenAI. OpenAI takes that capital and uses a significant portion of it to purchase Nvidia GPUs for training and inference. Nvidia reports that GPU revenue on their earnings. The stock goes up. Investors celebrate.

But that revenue was partially generated by Nvidia''s own investment dollars coming back to them as hardware purchases. The money is moving in a circle. Revenue looks inflated. Growth looks artificial. And suddenly, the entire AI boom starts resembling something uncomfortably close to a financial bubble.

Scaling back these direct investments is Nvidia''s way of breaking that cycle. It signals financial discipline. It tells Wall Street that their revenue growth is organic, driven by genuine demand from dozens of customers, not recycled capital from two or three companies they happen to fund.

## The Custom Chip Threat

Meanwhile, the competitive landscape is shifting underneath Nvidia''s feet.

Amazon is aggressively developing Trainium, their custom AI training chip built by Annapurna Labs in Austin, Texas. The goal is explicit: cut AI computing costs by up to 40% and reduce reliance on Nvidia''s dominant GPUs ([TRT World](https://www.trtworld.com/article/e0483751b062)). Google continues to expand their TPU ecosystem, which already powers significant portions of their internal AI workloads including the Gemini model family. Meta has explored custom silicon for their Llama models.

The message from the cloud giants is clear: we do not want to be permanently dependent on a single hardware supplier.

Nvidia''s response to this threat is strategic focus. Rather than spreading resources across hardware development, software ecosystems, and massive venture investments in AI companies, they are consolidating. Every dollar and every engineering hour goes toward making sure their chips and their CUDA software platform remain so far ahead that building alternatives feels futile.

Investing billions into OpenAI and Anthropic was a distraction from that mission. Now, the distraction is gone.

## The Stakes That Actually Matter

![Investment Comparison](/images/journal/investment-comparison.png)

To understand how modest Nvidia''s position really is, you need to see what the real power players have committed. The contrast is staggering.

### Microsoft and OpenAI: A Marriage, Not an Investment

Microsoft has invested $13.8 billion into OpenAI. Following the 2025 corporate restructuring, Microsoft now owns a confirmed 27% equity stake, valued at approximately $135 billion ([Fortune](https://fortune.com/article/microsoft-ceo-satya-nadella-bill-gates-openai-sam-altman-youre-going-to-burn-this-billion-dollars-big-tech/)). In the same restructuring deal, OpenAI agreed to purchase $250 billion worth of Azure cloud services ([Data Center Dynamics](https://www.datacenterdynamics.com/en/news/openai-completes-for-profit-move-microsoft-given-27-stake-and-250bn-azure-contract-but-no-longer-has-cloud-right-of-first-refusal/)).

This is not a financial investment. This is a strategic merger in everything but name. Microsoft''s Copilot, Bing, Azure AI, and the entire Office suite are fundamentally powered by OpenAI''s technology. Their futures are permanently intertwined. And crucially, a massive portion of every dollar Microsoft puts into OpenAI flows directly back into Microsoft Azure revenue.

### Amazon and Anthropic: The Cloud Lock In

Amazon invested $8 billion into Anthropic, securing a stake of roughly 7.8% based on SEC filing estimates. That stake is now valued at approximately $60.6 billion, a seven fold increase on the original investment ([Business Insider](https://www.businessinsider.com/amazon-ai-bet-anthropic-soars-61-billion-valuation-2026-2), [Om Malik](https://om.co/2026/02/27/amazon-the-cost-of-ai-lateness/)).

The deal ensures that Anthropic uses Amazon Web Services for its cloud computing needs. In return, Anthropic''s Claude models serve as a flagship AI offering on Amazon''s enterprise platform. Anthropic is expected to pay Amazon, Google, and Microsoft at least $80 billion in cloud computing costs through 2029 ([Seeking Alpha](https://seekingalpha.com/news/4553201-anthropic-may-share-up-to-64b-with-amazon-google-microsoft-in-2027)). Every dollar Anthropic spends on compute flows directly back into AWS revenue. The investment is a customer acquisition strategy disguised as venture capital.

### Google: The Calculated Hedge

Then there is Google, playing a game entirely their own. Court documents revealed that Google owns 14% of Anthropic, having invested roughly $3 billion across multiple rounds ([Data Center Dynamics](https://www.datacenterdynamics.com/en/news/google-owns-14-percent-of-generative-ai-business-anthropic/)). The twist: Google is simultaneously building Gemini, their own massive AI model family that competes directly with Claude. In January 2025, Google committed an additional $1 billion, bringing their total investment to around $3 billion ([CNBC](https://www.cnbc.com/2026/03/06/google-says-anthropic-remains-available-outside-of-defense-projects.html)).

The Anthropic stake is a hedge. If Gemini wins, Google dominates with their own technology. If Anthropic''s research pulls ahead, Google still has a seat at the table. It is a calculated insurance policy from a company that can afford to bet on both outcomes.

### Nvidia: The Side Bet

Nvidia''s positions in both companies amount to roughly 3% stakes. Financial plays designed to keep hardware sales flowing smoothly. Microsoft, Amazon, and Google made existential bets on the future of their cloud computing and software platforms. Nvidia placed side bets to maintain relationships. And now those side bets are being cashed out.

## The Circular Spending Dynamic

Here is the detail that often gets overlooked, and it is arguably the most important part of this entire story.

The circular capital flow problem is not unique to Nvidia. It runs through the entire AI investment ecosystem.

When Microsoft invests $13.8 billion into OpenAI, a significant portion of that capital goes straight to Microsoft Azure for cloud computing costs. When Amazon invests $8 billion into Anthropic, much of it flows back into AWS. The investors are simultaneously the vendors. The money circulates within their own ecosystems, inflating both the valuation of the AI company and the revenue of the cloud provider in a single motion.

Anthropic alone is expected to spend at least $80 billion on cloud services from Amazon, Google, and Microsoft through 2029. These are the same companies that funded Anthropic''s growth. The money goes out as an investment and comes back as cloud revenue.

This is why Nvidia stepping back is so notable. They recognized the optics of circular capital flows and acted before anyone forced their hand. The cloud giants are still deep in that dynamic. Whether public markets will scrutinize those arrangements with equal intensity once these companies are publicly traded remains one of the most important open questions in technology finance.

## What This Means for Everyone Else

For businesses outside the Silicon Valley bubble, the implications are practical and immediate.

**The AI infrastructure layer is stabilizing.** Nvidia stepping back from ownership positions signals that the AI hardware market is maturing. Competition from custom chips (Amazon''s Trainium, Google''s TPUs) means compute costs will continue falling. If you are building products that rely on AI, your infrastructure costs are heading in the right direction.

**The model layer is fragmenting.** The Pentagon situation demonstrates that choosing an AI provider is no longer just a technical decision. It is a political and regulatory one. Businesses that build on a single model provider face risks that did not exist twelve months ago. Multi model architectures and abstraction layers are becoming a practical necessity, not a luxury.

**The IPO wave will reshape access.** When OpenAI and Anthropic go public, the dynamics of who gets access to what, and at what price, will shift. Enterprise contracts will become more standardized. Pricing will become more transparent. For mid market businesses, this is likely a net positive.

## The Bottom Line

Nvidia is not abandoning OpenAI or Anthropic. The technological partnership remains intact. Both companies will continue purchasing enormous quantities of Nvidia hardware. The engineering collaboration continues.

What has changed is the financial entanglement. Nvidia is drawing a clean line between being a technology partner and being a financial stakeholder. They want the revenue without the obligations. The influence without the exposure. The upside without the politics.

The AI industry is not slowing down. It is growing up. And Nvidia is positioning themselves exactly where they want to be when it does: at the foundation, selling to everyone, owned by no one.

---

### Sources

1. Reuters. "Nvidia CEO hints at end of investments in OpenAI, Anthropic." March 4, 2026. [reuters.com](https://www.reuters.com/business/nvidia-will-not-be-able-invest-100-billion-openai-due-ipo-ceo-jensen-says-2026-03-04/)
2. CNBC. "Nvidia CEO Huang says $30 billion OpenAI investment might be the last." March 4, 2026. [cnbc.com](https://www.cnbc.com/2026/03/04/nvidia-huang-openai-investment.html)
3. TechCrunch. "Jensen Huang says Nvidia is pulling back from OpenAI and Anthropic." March 4, 2026. [techcrunch.com](https://techcrunch.com/2026/03/04/jensen-huang-says-nvidia-is-pulling-back-from-openai-and-anthropic-but-his-explanation-raises-more-questions-than-it-answers/)
4. The New York Times. "Anthropic Is Valued at $380 Billion in New Funding Round." February 12, 2026. [nytimes.com](https://www.nytimes.com/2026/02/12/technology/anthropic-valuation-380-billion-funding.html)
5. Fortune. "Microsoft CEO says Bill Gates opposed his OpenAI bet." February 2026. [fortune.com](https://fortune.com/article/microsoft-ceo-satya-nadella-bill-gates-openai-sam-altman-youre-going-to-burn-this-billion-dollars-big-tech/)
6. Data Center Dynamics. "OpenAI completes for profit move, Microsoft given 27% stake." February 2026. [datacenterdynamics.com](https://www.datacenterdynamics.com/en/news/openai-completes-for-profit-move-microsoft-given-27-stake-and-250bn-azure-contract-but-no-longer-has-cloud-right-of-first-refusal/)
7. Business Insider. "Amazon $8 billion Anthropic investment balloons to $61 billion." February 2026. [businessinsider.com](https://www.businessinsider.com/amazon-ai-bet-anthropic-soars-61-billion-valuation-2026-2)
8. Om Malik. "Amazon and The Cost of (AI) Lateness." February 27, 2026. [om.co](https://om.co/2026/02/27/amazon-the-cost-of-ai-lateness/)
9. Data Center Dynamics. "Google owns 14 percent of generative AI business Anthropic." February 2026. [datacenterdynamics.com](https://www.datacenterdynamics.com/en/news/google-owns-14-percent-of-generative-ai-business-anthropic/)
10. The Guardian. "OpenAI to work with Pentagon after Anthropic dropped." February 28, 2026. [theguardian.com](https://www.theguardian.com/technology/2026/feb/28/openai-us-military-anthropic)
11. MIT Technology Review. "OpenAI compromise with the Pentagon is what Anthropic feared." March 2, 2026. [technologyreview.com](https://www.technologyreview.com/2026/03/02/1133850/openais-compromise-with-the-pentagon-is-what-anthropic-feared/)
12. BBC. "OpenAI changes deal with US military after backlash." March 2026. [bbc.com](https://www.bbc.com/news/articles/c3rz1nd0egro)
13. CNBC. "Anthropic and the Pentagon are back at the negotiating table." March 5, 2026. [cnbc.com](https://www.cnbc.com/2026/03/05/anthropic-pentagon-ai-deal-department-of-defense-openai-.html)
14. TRT World. "Amazon bets on Texas and custom Trainium chips to challenge Nvidia." February 2026. [trtworld.com](https://www.trtworld.com/article/e0483751b062)
15. Seeking Alpha. "Anthropic may share up to $6.4B with Amazon, Google, Microsoft in 2027." February 18, 2026. [seekingalpha.com](https://seekingalpha.com/news/4553201-anthropic-may-share-up-to-64b-with-amazon-google-microsoft-in-2027)
16. PYMNTS. "Nvidia Signals Final Investments in OpenAI and Anthropic." March 4, 2026. [pymnts.com](https://www.pymnts.com/artificial-intelligence-2/2026/nvidia-signals-final-investments-in-openai-and-anthropic/)',
  (SELECT id FROM journal_pillars WHERE slug = 'engineering' LIMIT 1),
  (SELECT id FROM journal_authors WHERE slug = 'craefto-lab' LIMIT 1),
  'article',
  '/images/journal/hero-nvidia-ai.png',
  'Abstract visualization of Nvidia GPU chip glowing with green circuitry light representing AI infrastructure dominance',
  'Why Nvidia Stepped Back from OpenAI and Anthropic | Craefto',
  'Jensen Huang confirmed Nvidia is done with massive investments in OpenAI and Anthropic. Here is what it means for AI infrastructure, circular capital flows, and the future of the industry.',
  ARRAY['nvidia', 'openai', 'anthropic', 'ai investment', 'jensen huang', 'ai infrastructure', 'gpu', 'ipo', 'microsoft', 'amazon', 'google', 'pentagon ai'],
  10,
  2800,
  'published',
  NOW(),
  TRUE,
  FALSE
ON CONFLICT (slug) DO NOTHING;

-- Add to engineering pillar (primary) and product pillar (secondary)
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT a.id, p.id, TRUE, 0
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE a.slug = 'nvidia-steps-back-openai-anthropic' AND p.slug = 'engineering'
ON CONFLICT (article_id, pillar_id) DO NOTHING;

INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT a.id, p.id, FALSE, 1
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE a.slug = 'nvidia-steps-back-openai-anthropic' AND p.slug = 'product'
ON CONFLICT (article_id, pillar_id) DO NOTHING;
