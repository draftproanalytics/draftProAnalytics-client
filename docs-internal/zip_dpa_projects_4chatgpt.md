cd ~/aiAssistWS

zip -r draftProAnalytics-client-teamNeed-withNode.zip draftProAnalytics-client \
  -x "draftProAnalytics-client/node_modules/*" \
     "draftProAnalytics-client/dist/*" \
     "draftProAnalytics-client/coverage/*" \
     "draftProAnalytics-client/.git/*" \
     "draftProAnalytics-client/.vite/*" \
     "draftProAnalytics-client/.env" \
     "draftProAnalytics-client/.env.*" \
     "draftProAnalytics-client/*.log" \
     "draftProAnalytics-client/logs/*"


cd ~/aiAssistWS

zip -r draftProAnalytics-server-teamNeed-withNode.zip draftProAnalytics-server \
  -x "draftProAnalytics-server/dist/*" \
     "draftProAnalytics-server/coverage/*" \
     "draftProAnalytics-server/.git/*" \
     "draftProAnalytics-server/.env" \
     "draftProAnalytics-server/.env.*" \
     "draftProAnalytics-server/*.log" \
     "draftProAnalytics-server/logs/*" \
     "draftProAnalytics-server/tmp/*" \
     "draftProAnalytics-server/uploads/*"

-x "draftProAnalytics-client/node_modules/*" \
-x "draftProAnalytics-server/node_modules/*" \

GET https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2027/draft/athletes?limit=1000
GET https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2027/draft